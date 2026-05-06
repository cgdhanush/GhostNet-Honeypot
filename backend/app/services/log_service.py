from typing import Any, List

from motor.motor_asyncio import AsyncIOMotorDatabase

async def get_logs(
    db: AsyncIOMotorDatabase,
    event_type: str | None = None,
    ip: str | None = None,
    limit: int | None = None,
) -> List[dict[str, Any]]:
    ssh_event_types = [
        "NEW_CONNECTION",
        "RAW_IN",
        "VERSION_EXCHANGE",
        "KEXINIT",
        "USERAUTH_REQUEST",
    ]

    query: dict[str, Any] = {
        "EVENT": {"$in": ssh_event_types},
        "SRC_HOST": {"$exists": True},
        "DST_HOST": {"$exists": True},
        "SRC_PORT": {"$exists": True},
        "DST_PORT": {"$exists": True},
        "CONN_ID": {"$exists": True},
    }

    if event_type:
        query["EVENT"] = event_type

    if ip:
        query["$or"] = [
            {"SRC_HOST": {"$regex": ip, "$options": "i"}},
            {"DST_HOST": {"$regex": ip, "$options": "i"}},
        ]

    cursor = db.events.find(query).sort("timestamp", -1)

    length = limit if limit is not None else 100
    return await cursor.to_list(length=length)

async def get_sessions(
    db: AsyncIOMotorDatabase,
) -> List[dict[str, Any]]:
    ssh_match_stage = {
        "$match": {
            "CONN_ID": {"$exists": True},
            "SRC_HOST": {"$exists": True},
            "DST_HOST": {"$exists": True},
            "EVENT": {"$in": [
                "NEW_CONNECTION",
                "RAW_IN",
                "VERSION_EXCHANGE",
                "KEXINIT",
                "USERAUTH_REQUEST",
            ]},
        }
    }

    pipeline = [
        ssh_match_stage,
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
        },
        {"$sort": {"last_seen": -1}},
    ]

    cursor = db.events.aggregate(pipeline)
    return await cursor.to_list(length=1000)

async def get_session_detail(
    db: AsyncIOMotorDatabase,
    conn_id: str,
) -> List[dict[str, Any]]:
    query = {
        "CONN_ID": conn_id,
        "EVENT": {"$in": [
            "NEW_CONNECTION",
            "RAW_IN",
            "VERSION_EXCHANGE",
            "KEXINIT",
            "USERAUTH_REQUEST",
        ]},
        "SRC_HOST": {"$exists": True},
        "DST_HOST": {"$exists": True},
        "SRC_PORT": {"$exists": True},
        "DST_PORT": {"$exists": True},
    }

    cursor = db.events.find(query).sort("timestamp", 1)
    return await cursor.to_list(length=1000)

async def get_stats(
    db: AsyncIOMotorDatabase,
) -> dict[str, Any]:
    ssh_filter = {
        "CONN_ID": {"$exists": True},
        "SRC_HOST": {"$exists": True},
        "EVENT": {"$in": [
            "NEW_CONNECTION",
            "RAW_IN",
            "VERSION_EXCHANGE",
            "KEXINIT",
            "USERAUTH_REQUEST",
        ]},
    }

    event_types: list[EventType] = [
        "NEW_CONNECTION",
        "RAW_IN",
        "VERSION_EXCHANGE",
        "KEXINIT",
        "USERAUTH_REQUEST",
    ]

    total_connections = await db.events.distinct("CONN_ID", ssh_filter)
    unique_ips = await db.events.distinct("SRC_HOST", ssh_filter)

    event_type_counts: dict[str, int] = {}

    for event_type in event_types:
        event_type_counts[event_type] = await db.events.count_documents(
            {**ssh_filter, "EVENT": event_type}
        )

    auth_attempts = await db.events.count_documents(
        {**ssh_filter, "EVENT": "USERAUTH_REQUEST"}
    )

    return {
        "total_connections": len(total_connections),
        "unique_ips": len(unique_ips),
        "total_auth_attempts": auth_attempts,
        "event_type_counts": event_type_counts,
    }