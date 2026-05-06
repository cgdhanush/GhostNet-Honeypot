from datetime import datetime
from enum import Enum
from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field, field_serializer


# ---------- AUTH INPUT MODELS ----------


class AuthRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    email: EmailStr
    password: str = Field(..., min_length=8)


class AuthLogin(BaseModel):
    identifier: str = Field(..., min_length=3)
    password: str = Field(..., min_length=2)


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
    username: str = Field(..., min_length=3, max_length=64)
    password: str  # raw password only for creation layer


class UserInDB(UserBase):
    id: str
    username: str
    hashed_password: str
    is_active: bool = True
    created_at: datetime


class UserRead(UserBase):
    id: str
    username: str
    is_active: bool
    created_at: datetime


class AuthResponse(Token):
    user: UserRead


class EventType(str, Enum):
    NEW_CONNECTION = "NEW_CONNECTION"
    RAW_IN = "RAW_IN"
    VERSION_EXCHANGE = "VERSION_EXCHANGE"
    KEXINIT = "KEXINIT"
    USERAUTH_REQUEST = "USERAUTH_REQUEST"


class SSHLog(BaseModel):
    id: str | None = None  # map _id → id

    EVENT: EventType
    SRC_HOST: str
    SRC_PORT: int
    DST_HOST: str
    DST_PORT: int
    CONN_ID: str
    timestamp: str

    LOCALVERSION: str | None = None
    REMOTE_PEER_VERSION: str | None = None
    USERNAME: str | None = None
    PASSWORD: str | None = None
    KEY_TYPE: str | None = None
    COMMAND: str | None = None

    model_config = {"extra": "allow"}

    @field_serializer("id")
    def serialize_id(self, v):
        return str(v) if isinstance(v, ObjectId) else v

class Session(BaseModel):
    id: str | None = None  # map _id → id

    CONN_ID: str
    SRC_HOST: str
    SRC_PORT: int
    DST_HOST: str
    DST_PORT: int
    first_seen: str
    last_seen: str
    event_count: int
    last_event_type: EventType
    events: list[SSHLog]

    model_config = {"extra": "allow",}

    @field_serializer("id")
    def serialize_id(self, v):
        return str(v) if isinstance(v, ObjectId) else v


class Stats(BaseModel):
    total_connections: int
    unique_ips: int
    total_auth_attempts: int
    event_type_counts: dict[EventType, int]
