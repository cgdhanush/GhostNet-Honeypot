from typing import Any, Iterable, List

from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.app.schemas import EventType


async def get_logs(
    db: AsyncIOMotorDatabase,
    event_type: str | None = None,
    ip: str | None = None,
    limit: int | None = None,
) -> List[dict[str, Any]]:
    query: dict[str, Any] = {}

    if event_type:
        query["EVENT"] = event_type

    if ip:
        query["$or"] = [
            {"SRC_HOST": {"$regex": ip, "$options": "i"}},
            {"DST_HOST": {"$regex": ip, "$options": "i"}},
        ]

    cursor = db.logs.find(query).sort("timestamp", -1)
    length = limit if limit is not None else 100
    return await cursor.to_list(length=length)


async def get_sessions(
    db: AsyncIOMotorDatabase,
) -> List[dict[str, Any]]:
    pipeline = [
        {
            "$group": {
                "_id": "$CONN_ID",
                "CONN_ID": {"$first": "$CONN_ID"},
                "SRC_HOST": {"$first": "$SRC_HOST"},
                "SRC_PORT": {"$first": "$SRC_PORT"},
                "DST_HOST": {"$first": "$DST_HOST"},
                "DST_PORT": {"$first": "$DST_PORT"},
                "first_seen": {"$min": "$timestamp"},
                "last_seen": {"$max": "$timestamp"},
                "event_count": {"$sum": 1},
                "last_event_type": {"$last": "$EVENT"},
                "events": {"$push": "$$ROOT"},
            }
        }
    ]
    cursor = db.logs.aggregate(pipeline)
    return await cursor.to_list(length=1000)


async def get_session_detail(
    db: AsyncIOMotorDatabase,
    conn_id: str,
) -> List[dict[str, Any]]:
    cursor = db.logs.find({"CONN_ID": conn_id}).sort("timestamp", 1)
    return await cursor.to_list(length=1000)


async def get_stats(
    db: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    event_types: list[EventType] = [
        "NEW_CONNECTION",
        "RAW_IN",
        "VERSION_EXCHANGE",
        "KEXINIT",
        "USERAUTH_REQUEST",
    ]

    total_connections = await db.logs.distinct("CONN_ID")
    unique_ips = await db.logs.distinct("SRC_HOST")
    event_type_counts: dict[str, int] = {}

    for event_type in event_types:
        event_type_counts[event_type] = await db.logs.count_documents(
            {"EVENT": event_type}
        )

    auth_attempts = await db.logs.count_documents({"EVENT": "USERAUTH_REQUEST"})

    return {
        "total_connections": len(total_connections),
        "unique_ips": len(unique_ips),
        "total_auth_attempts": auth_attempts,
        "event_type_counts": event_type_counts,
    }
