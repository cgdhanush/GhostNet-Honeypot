import logging

from ghostnet.loggers import LoggingMixin

logger = logging.getLogger(__name__)

class GhostNet:
    def __init__(self):
        LoggingMixin.__init__(self, logger)
    
    def start_ssh_honeypot(self):

        logger.info("Starting SSH honeypot mode...")
        from ghostnet.ssh.ssh import main
        main()


