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
        # docs_url="/docs",
        # redoc_url="/redoc",
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


def start_app(config: dict, standalone: bool = False):
    """
    Start API ... should be run in thread.
    """
    # Load settings from config dict
    settings.load_from_dict(config)
    

    rest_ip = config.get("api_server", {}).get("listen_ip_address") 
    rest_port = config.get("api_server", {}).get("listen_port")

    logger.info(f"Starting HTTP Server at http://{rest_ip}:{rest_port}")

    if not ip_address(rest_ip).is_loopback:
        logger.warning(
            "SECURITY WARNING - Local Rest Server listening to external connections"
        )
        logger.warning(
            "SECURITY WARNING - This is insecure, use 127.0.0.1 in config"
        )

    verbosity = config.get("api_server", {}).get("verbosity", "error")

    uvconfig = uvicorn.Config(
        app,
        host=rest_ip,
        port=rest_port,
        log_level=verbosity,
        use_colors=False,
        access_log=(verbosity != "error"),
        ws_ping_interval=None,
    )

    try:
        server = UvicornServer(uvconfig)

        if standalone:
            uvicorn.run(
                app,
                host=rest_ip,
                port=rest_port,
            )
            logger.info("Uvicorn started in standalone mode")
            return None, None
        else:
            thread = server.run_in_thread()
            logger.info("Uvicorn started in thread: FTUvicorn")
            return server, thread

    except Exception:
        logger.exception("API server failed to start")
        raise
