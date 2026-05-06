from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
    )

    APP_NAME: str = "Honeyfot System"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ]

    MONGODB_URI: str = "mongodb://admin:admin1234@127.0.0.1:27017/?authSource=admin"
    MONGODB_DB: str = "honeyfot"
    MONGODB_EVENT_DB: str = "ssh_logs"

    SECRET_KEY: str = "00aabbccddeeff00112233445566778899aabbccd899"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    JWT_ALGORITHM: str = "HS256"


settings = Settings()