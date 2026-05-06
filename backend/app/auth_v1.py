
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.app.session import get_db

from backend.app.schemas import AuthLogin, AuthRegister, TokenRefreshRequest
from backend.app.schemas import Token
from backend.app.config.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password,
)
from backend.app.schemas import AuthRegister
from backend.app.schemas import UserCreate
from backend.app.services.user_service import create_user, get_user_by_email


router = APIRouter()


async def authenticate_user(
    db: AsyncIOMotorDatabase, email: str, password: str
) -> dict[str, Any]:
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def register_user(
    db: AsyncIOMotorDatabase, user_in: AuthRegister
) -> dict[str, Any]:
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists",
        )
    return await create_user(db, UserCreate(**user_in.model_dump()))


def create_tokens_for_user(user: dict[str, Any]) -> dict[str, str]:
    return {
        "access_token": create_access_token(subject=str(user["id"])),
        "refresh_token": create_refresh_token(subject=str(user["id"])),
    }


def refresh_access_token(refresh_token: str) -> dict[str, str]:
    try:
        payload = decode_token(refresh_token)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    return {
        "access_token": create_access_token(subject=str(user_id)),
        "refresh_token": refresh_token,
    }


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    payload: AuthRegister,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict[str, str]:
    user = await register_user(db, payload)
    return {**create_tokens_for_user(user), "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(
    payload: AuthLogin,
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict[str, str]:
    user = await authenticate_user(db, payload.identifier, payload.password)
    return {**create_tokens_for_user(user), "token_type": "bearer"}


@router.post("/refresh", response_model=Token)
def refresh(payload: TokenRefreshRequest) -> dict[str, str]:
    return {**refresh_access_token(payload.refresh_token), "token_type": "bearer"}
