import logging
from typing import Any

logger = logging.getLogger(__name__)

def start_webserver(args: dict[str, Any]) -> None:
    """
    Main entry point for webserver mode
    """
    from ghostnet.ghostnet import GhostNet
    ghostnet = GhostNet(args=args)
    ghostnet.start_api_server()
