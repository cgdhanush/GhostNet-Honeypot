import logging

from ghostnet.loggers import LoggingMixin

logger = logging.getLogger(__name__)

class GhostNet:
    def __init__(self):
        LoggingMixin.__init__(self, logger)

    def start(self):
        print("Starting GhostNet...")

    def stop(self):
        print("Stopping GhostNet...")