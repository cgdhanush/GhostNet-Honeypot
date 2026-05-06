from ipaddress import ip_address
import logging
import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from backend.app.config.config import settings
from backend.app.auth_v1 import router as auth_router
from backend.app.app_v1 import app_router, public_router
from backend.app.uvicorn_threaded import UvicornServer
from backend.app.web_ui import router_ui

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.include_router(public_router, prefix="/api/v1", tags=["public"])

    app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
    app.include_router(app_router, prefix="/api/v1", tags=["app"])
    app.include_router(router_ui, prefix="")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_app()


def start_app(config: dict):
    """
    Start API ... should be run in thread.
    """
    rest_ip = config.get("api_server", {}).get("listen_ip_address") or "localhost"
    rest_port = config.get("api_server", {}).get("listen_port") or 8000

    logger.info(f"Starting HTTP Server at {rest_ip}:{rest_port}")
    if not ip_address(rest_ip).is_loopback:
        logger.warning(
            "SECURITY WARNING - Local Rest Server listening to external connections"
        )
        logger.warning(
            "SECURITY WARNING - This is insecure please set to your loopback,"
            "e.g 127.0.0.1 in config.json"
        )

    logger.info("Starting Local Rest Server.")
    verbosity = config["api_server"].get("verbosity", "error")

    uvconfig = uvicorn.Config(
        app,
        port=rest_port,
        host=rest_ip,
        use_colors=False,
        log_config=None,
        access_log=True if verbosity != "error" else False,
        ws_ping_interval=None,  # We do this explicitly ourselves
    )

    try:
        server = UvicornServer(uvconfig)
        server.run_in_thread()
    except Exception:
        logger.exception("Api server failed to start.")
