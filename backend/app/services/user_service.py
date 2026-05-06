from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from backend.app.config.security import hash_password
from backend.app.schemas import UserCreate


def _serialize_user(document: dict[str, Any] | None) -> dict[str, Any] | None:
    if not document:
        return None

    return {
        'id': str(document['_id']),
        'email': document['email'],
        'hashed_password': document['hashed_password'],
        'is_active': document.get('is_active', True),
        'created_at': document['created_at'],
    }


async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> dict[str, Any] | None:
    document = await db.users.find_one({'email': email})
    return _serialize_user(document)


async def get_user(db: AsyncIOMotorDatabase, user_id: str) -> dict[str, Any] | None:
    if not ObjectId.is_valid(user_id):
        return None

    document = await db.users.find_one({'_id': ObjectId(user_id)})
    return _serialize_user(document)


async def create_user(db: AsyncIOMotorDatabase, user_in: UserCreate) -> dict[str, Any]:
    user_data = {
        'email': user_in.email,
        'hashed_password': hash_password(user_in.password),
        'is_active': True,
        'created_at': datetime.utcnow(),
    }
    result = await db.users.insert_one(user_data)
    user_data['_id'] = result.inserted_id
    return _serialize_user(user_data)
