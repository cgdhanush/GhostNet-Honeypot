from fastapi import APIRouter, Depends

from backend.app.schemas import UserRead
from backend.app.session import get_current_user

app_router = APIRouter()
public_router = APIRouter()


@public_router.get("/ping")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app_router.get("/users/me", response_model=UserRead)
async def read_current_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user
