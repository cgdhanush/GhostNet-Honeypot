import logging

from twisted.internet import reactor, endpoints
from twisted.cred import portal, credentials, error

from ghostnet.data.manager import Manager
from ghostnet.data.handler import MongoHandler

from ghostnet.data.handler import MongoHandler
from ghostnet.loggers import LoggingMixin
from ghostnet.ssh.ssh import LoggingPasswordChecker, SimpleSSHFactory, SimpleSSHRealm

logger = logging.getLogger(__name__)

class GhostNet:
    def __init__(self):
        LoggingMixin.__init__(self, logger)

        self.client = Manager().get_client()

    
    def start_ssh_honeypot(self):

        logger.info("Starting SSH honeypot mode...")
        
        db = self.client["ssh_logs"]
        collection = db["events"]
        
        log = logging.getLogger("ssh")
        log.addHandler(MongoHandler(collection))

        ssh_factory = SimpleSSHFactory("SSH-2.0-OpenSSH_7.4")
        ssh_realm = SimpleSSHRealm()
        ssh_portal = portal.Portal(ssh_realm)
        ssh_portal.registerChecker(LoggingPasswordChecker())
        ssh_factory.portal = ssh_portal

        endpoint = endpoints.TCP4ServerEndpoint(reactor, 2222, interface="0.0.0.0")
        endpoint.listen(ssh_factory)

        reactor.run()



