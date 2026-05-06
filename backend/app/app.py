from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config.config import settings
from backend.app.auth_v1 import router as auth_router
from backend.app.app_v1 import app_router, public_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version='1.0.0',
        docs_url='/docs',
        redoc_url='/redoc',
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    app.include_router(public_router, prefix='/api/v1', tags=['public'])

    app.include_router(auth_router, prefix='/api/v1/auth', tags=['auth'])
    app.include_router(app_router, prefix='/api/v1', tags=['app'])
    return app

app = create_app()
