from datetime import datetime
from pydantic import BaseModel, EmailStr


# ---------- AUTH INPUT MODELS ----------

class AuthRegister(BaseModel):
    email: EmailStr
    password: str


class AuthLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# ---------- TOKEN MODEL ----------

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ---------- USER MODELS ----------

class UserBase(BaseModel):
    email: EmailStr


class UserCreate(UserBase):
    password: str   # raw password only for creation layer


class UserInDB(UserBase):
    id: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime


class UserRead(UserBase):
    id: str
    is_active: bool
    created_at: datetime