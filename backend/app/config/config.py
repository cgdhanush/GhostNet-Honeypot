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

    MONGODB_URI: str = "mongodb://localhost:27017" 
    MONGODB_DB: str = "honeyfot"
    MONGODB_EVENT_DB: str = "ssh_logs"

    SECRET_KEY: str = "supersecretkey"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    JWT_ALGORITHM: str = "HS256"

    def load_from_dict(self, config: dict):
        for key, value in config.items():
            if hasattr(self, key):
                setattr(self, key, value)
                
settings = Settings()