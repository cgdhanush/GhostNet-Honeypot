from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.app.schemas import EventType, Session, Stats, SSHLog, UserRead
from backend.app.session import get_current_user, get_data_db
from backend.app.services.log_service import (
    get_logs,
    get_session_detail,
    get_sessions,
    get_stats,
)

app_router = APIRouter()
public_router = APIRouter()


@public_router.get("/ping")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app_router.get("/users/me", response_model=UserRead)
async def read_current_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user


@app_router.get("/logs", response_model=list[SSHLog])
async def api_get_logs(
    event_type: EventType | None = None,
    ip: str | None = None,
    limit: int | None = None,
    db: AsyncIOMotorDatabase = Depends(get_data_db),
) -> list[SSHLog]:
    docs = await get_logs(db, event_type=event_type, ip=ip, limit=limit)

    for doc in docs:
        doc["_id"] = str(doc["_id"])  # convert ObjectId → str

    return docs

@app_router.get("/sessions", response_model=list[Session])
async def api_get_sessions(
    db: AsyncIOMotorDatabase = Depends(get_data_db),
) -> list[Session]:
    docs = await get_sessions(db)

    for doc in docs:
        # map _id → id
        doc["id"] = str(doc.pop("_id"))

        # fix nested ObjectIds
        for event in doc.get("events", []):
            event.pop("_id", None)

    return docs 

@app_router.get("/sessions/{conn_id}", response_model=Session)
async def api_get_session_detail(
    conn_id: str,
    db: AsyncIOMotorDatabase = Depends(get_data_db),
) -> Session:
    session = await get_session_detail(db, conn_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return session[0]


@app_router.get("/stats", response_model=Stats)
async def api_get_stats(
    db: AsyncIOMotorDatabase = Depends(get_data_db),
) -> Stats:
    return await get_stats(db)
