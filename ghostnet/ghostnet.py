import logging
from typing import Any

from twisted.internet import reactor, endpoints
from twisted.cred import portal

from ghostnet.commands.arguments import ARGS_SSHSERVER, ARGS_WEBSERVER
from ghostnet.config import CONFIG
from ghostnet.data.manager import Manager
from ghostnet.data.handler import MongoHandler

from ghostnet.data.handler import MongoHandler
from ghostnet.loggers import LoggingMixin
from ghostnet.ssh.ssh import LoggingPasswordChecker, SimpleSSHFactory, SimpleSSHRealm

logger = logging.getLogger(__name__)


class GhostNet:
    def __init__(self, args: dict[str, Any] | None = None) -> None:
        LoggingMixin.__init__(self, logger)

        self.args = args
        self._init()

        self.client = Manager().get_client()

    def _init(self) -> None:
        self.config: dict[str, dict] = CONFIG.copy()

        ssh_args = {
            key: value for key, value in self.args.items() if key in ARGS_SSHSERVER
        }
        self.config["ssh_config"].update(ssh_args)

        web_args = {
            key: value for key, value in self.args.items() if key in ARGS_WEBSERVER
        }
        self.config["api_server"].update(web_args)


    def start_ssh_honeypot(self):

        logger.info("Starting SSH honeypot mode...")

        db = self.client["ssh_logs"]
        collection = db["events"]

        log = logging.getLogger("ssh")
        log.addHandler(MongoHandler(collection))

      
        ssh_factory = SimpleSSHFactory(self.config["ssh_config"]["version"])
        ssh_realm = SimpleSSHRealm()
        ssh_portal = portal.Portal(ssh_realm)
        ssh_portal.registerChecker(LoggingPasswordChecker())
        ssh_factory.portal = ssh_portal

        endpoint = endpoints.TCP4ServerEndpoint(
            reactor, self.config["ssh_config"]["port"], interface=self.config["ssh_config"]["hostname"]
        )
        endpoint.listen(ssh_factory)

        reactor.run()

    def start_api_server(self):
        from backend.app.app import start_app
        start_app(self.config, standalone=True)

    def start(self):
        from backend.app.app import start_app

        start_app(config=self.config)
        self.start_ssh_honeypot()
