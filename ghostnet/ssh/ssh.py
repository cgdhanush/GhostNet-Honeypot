import logging
import os
import base64
import binascii
import hashlib
import random
from warnings import filterwarnings

filterwarnings("ignore")

from twisted.internet import reactor, endpoints, defer
from twisted.conch.ssh import factory, keys, userauth, connection, transport
from twisted.conch import avatar, interfaces as conchinterfaces
from twisted.cred import portal, credentials, error
from twisted.internet.threads import deferToThread
from twisted.python import log
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from twisted.logger import ILogObserver
from twisted.logger import globalLogPublisher

from ghostnet.data.manager import Database

try:
    from cryptography.hazmat.primitives.asymmetric import ed25519
except Exception:
    ed25519 = None

from zope.interface import implementer

script_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "keys")

logger = logging.getLogger(__name__)

def _b2s(x):
    if x is None:
        return ""
    if isinstance(x, (bytes, bytearray)):
        return x.decode("utf-8", "replace")
    return str(x)


def _u32_be(b):
    if not b or len(b) < 4:
        return 0
    return int.from_bytes(b[:4], "big", signed=False)


def _get_ns(b):
    if not b or len(b) < 4:
        return b"", b""
    ln = _u32_be(b)
    if ln < 0:
        return b"", b""
    start = 4
    end = 4 + ln
    if end > len(b):
        return b"", b""
    return b[start:end], b[end:]


def _sha256_hex(b):
    return hashlib.sha256(b or b"").hexdigest()


def _hex_prefix(b, n=256):
    return binascii.hexlify((b or b"")[:n]).decode("ascii", "ignore")


def _b64_prefix(b, n=768):
    try:
        return base64.b64encode((b or b"")[:n]).decode("ascii", "ignore")
    except Exception:
        return ""


def _printable_ratio(b):
    if not b:
        return 1.0
    p = 0
    for c in b:
        if c in (9, 10, 13) or (32 <= c <= 126):
            p += 1
    return p / max(1, len(b))


def _ssh_fp_sha256_from_blob(key_blob):
    try:
        digest = hashlib.sha256(key_blob).digest()
        return "SHA256:" + base64.b64encode(digest).rstrip(b"=").decode("ascii")
    except Exception:
        return ""


def getRSAKeys():
    public_key_path = os.path.join(script_dir, "id_rsa.pub")
    private_key_path = os.path.join(script_dir, "id_rsa")

    if not (os.path.exists(public_key_path) and os.path.exists(private_key_path)):
        ssh_key = rsa.generate_private_key(public_exponent=65537, key_size=2048, backend=default_backend())

        public_key = ssh_key.public_key().public_bytes(
            serialization.Encoding.OpenSSH, serialization.PublicFormat.OpenSSH
        )

        private_key = ssh_key.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.TraditionalOpenSSL,
            serialization.NoEncryption(),
        )

        with open(public_key_path, "wb") as key_file:
            key_file.write(public_key)

        with open(private_key_path, "wb") as key_file:
            key_file.write(private_key)
    else:
        with open(public_key_path, "rb") as key_file:
            public_key = key_file.read()

        with open(private_key_path, "rb") as key_file:
            private_key = key_file.read()

    return public_key, private_key


def _load_or_create_hostkey(path_base, make_key_fn, pub_format="openssh"):
    priv_path = path_base
    pub_path = path_base + ".pub"

    if not (os.path.exists(priv_path) and os.path.exists(pub_path)):
        key = make_key_fn()

        pub = key.public_key().public_bytes(
            serialization.Encoding.OpenSSH,
            serialization.PublicFormat.OpenSSH,
        )

        try:
            priv = key.private_bytes(
                serialization.Encoding.PEM,
                serialization.PrivateFormat.TraditionalOpenSSL,
                serialization.NoEncryption(),
            )
        except Exception:
            priv = key.private_bytes(
                serialization.Encoding.PEM,
                serialization.PrivateFormat.PKCS8,
                serialization.NoEncryption(),
            )

        with open(priv_path, "wb") as f:
            f.write(priv)
        with open(pub_path, "wb") as f:
            f.write(pub)

    with open(pub_path, "rb") as f:
        pub_b = f.read()
    with open(priv_path, "rb") as f:
        priv_b = f.read()

    return pub_b, priv_b


def getHostKeyDicts():
    rsa_pub, rsa_priv = getRSAKeys()

    publicKeys = {}
    privateKeys = {}

    try:
        publicKeys[b"ssh-rsa"] = keys.Key.fromString(data=rsa_pub)
        privateKeys[b"ssh-rsa"] = keys.Key.fromString(data=rsa_priv)
    except Exception:
        pass

    try:
        ecdsa_pub, ecdsa_priv = _load_or_create_hostkey(
            os.path.join(script_dir, "ssh_host_ecdsa_key"),
            lambda: ec.generate_private_key(ec.SECP256R1()),
        )
        publicKeys[b"ecdsa-sha2-nistp256"] = keys.Key.fromString(data=ecdsa_pub)
        privateKeys[b"ecdsa-sha2-nistp256"] = keys.Key.fromString(data=ecdsa_priv)
    except Exception:
        pass

    if ed25519 is not None:
        try:
            ed_pub, ed_priv = _load_or_create_hostkey(
                os.path.join(script_dir, "ssh_host_ed25519_key"),
                lambda: ed25519.Ed25519PrivateKey.generate(),
            )
            try:
                publicKeys[b"ssh-ed25519"] = keys.Key.fromString(data=ed_pub)
                privateKeys[b"ssh-ed25519"] = keys.Key.fromString(data=ed_priv)
            except Exception:
                pass
        except Exception:
            pass

    if not publicKeys or not privateKeys:
        publicKeys = {b"ssh-rsa": keys.Key.fromString(data=getRSAKeys()[0])}
        privateKeys = {b"ssh-rsa": keys.Key.fromString(data=getRSAKeys()[1])}

    return publicKeys, privateKeys


@implementer(portal.IRealm)
class SimpleSSHRealm:
    def requestAvatar(self, avatar_id, mind, *interfaces):
        if conchinterfaces.IConchUser in interfaces:
            return interfaces[0], SimpleSSHAvatar(avatar_id), lambda: None
        raise Exception("No supported interfaces found.")


class SimpleSSHAvatar(avatar.ConchUser):
    def __init__(self, username):
        avatar.ConchUser.__init__(self)
        self.username = username


class CustomSSHUserAuthServer(userauth.SSHUserAuthServer):
    def ssh_USERAUTH_REQUEST(self, packet):
        try:
            user_b, rest = _get_ns(packet)
            svc_b, rest = _get_ns(rest)
            meth_b, rest = _get_ns(rest)

            meth = _b2s(meth_b).lower()
            if meth != "password":
                peer = self.transport.transport.getPeer()
                us = self.transport.transport.getHost()

                out = {
                    "EVENT": "USERAUTH_REQUEST",
                    "METHOD": _b2s(meth_b),
                    "USERNAME": _b2s(user_b),
                    "SERVICE": _b2s(svc_b),
                    "SRC_HOST": getattr(peer, "host", ""),
                    "SRC_PORT": getattr(peer, "port", ""),
                    "DST_HOST": getattr(us, "host", ""),
                    "DST_PORT": getattr(us, "port", ""),
                    "LOCALVERSION": _b2s(getattr(self.transport, "ourVersionString", b"")),
                    "REMOTEVERSION": _b2s(getattr(self.transport, "otherVersionString", b"")),
                    "CONN_ID": getattr(self.transport, "_conn_id", ""),
                }

                if meth == "publickey":
                    has_sig = 0
                    try:
                        has_sig = int(rest[0]) if rest else 0
                        rest2 = rest[1:] if len(rest) > 1 else b""
                    except Exception:
                        has_sig = 0
                        rest2 = b""

                    alg_b, rest2 = _get_ns(rest2)
                    key_blob, rest2 = _get_ns(rest2)

                    out.update(
                        {
                            "PUBLICKEY_HAS_SIGNATURE": has_sig,
                            "PUBLIC_KEY_ALG": _b2s(alg_b),
                            "PUBLIC_KEY_FP_SHA256": _ssh_fp_sha256_from_blob(key_blob),
                            "PUBLIC_KEY_B64_PREFIX": _b64_prefix(key_blob, n=512),
                            "PUBLIC_KEY_LEN": str(len(key_blob or b"")),
                        }
                    )

                log.msg(out)
        except Exception:
            pass

        return userauth.SSHUserAuthServer.ssh_USERAUTH_REQUEST(self, packet)


class CustomSSHServerTransport(transport.SSHServerTransport):
    def __init__(self, our_version_string):
        self.ourVersionString = our_version_string.encode()
        self._conn_id = format(random.getrandbits(64), "x")
        self._raw_events = 0
        self._raw_events_max = 10
        self._raw_max_bytes = 8192
        self._ver_logged = False
        transport.SSHServerTransport.__init__(self)

    def connectionMade(self):
        try:
            peer = self.transport.getPeer()
            us = self.transport.getHost()
            log.msg(
                {
                    "EVENT": "NEW_CONNECTION",
                    "SRC_HOST": getattr(peer, "host", ""),
                    "SRC_PORT": getattr(peer, "port", ""),
                    "DST_HOST": getattr(us, "host", ""),
                    "DST_PORT": getattr(us, "port", ""),
                    "LOCALVERSION": _b2s(getattr(self, "ourVersionString", b"")),
                    "CONN_ID": self._conn_id,
                }
            )
        except Exception:
            pass
        return transport.SSHServerTransport.connectionMade(self)

    def dataReceived(self, data):
        try:
            self._log_raw_in(data)
        except Exception:
            pass

        out = transport.SSHServerTransport.dataReceived(self, data)

        try:
            if getattr(self, "gotVersion", False) and not self._ver_logged:
                self._ver_logged = True
                peer = self.transport.getPeer()
                us = self.transport.getHost()
                log.msg(
                    {
                        "EVENT": "VERSION_EXCHANGE",
                        "SRC_HOST": getattr(peer, "host", ""),
                        "SRC_PORT": getattr(peer, "port", ""),
                        "DST_HOST": getattr(us, "host", ""),
                        "DST_PORT": getattr(us, "port", ""),
                        "LOCALVERSION": _b2s(getattr(self, "ourVersionString", b"")),
                        "REMOTEVERSION": _b2s(getattr(self, "otherVersionString", b"")),
                        "CONN_ID": self._conn_id,
                    }
                )
        except Exception:
            pass

        return out

    def _log_raw_in(self, data):
        if self._raw_events >= self._raw_events_max:
            return
        self._raw_events += 1

        peer = self.transport.getPeer()
        us = self.transport.getHost()

        raw = (data or b"")[: self._raw_max_bytes]
        pr = _printable_ratio(raw)

        log.msg(
            {
                "EVENT": "RAW_IN",
                "SRC_HOST": getattr(peer, "host", ""),
                "SRC_PORT": getattr(peer, "port", ""),
                "DST_HOST": getattr(us, "host", ""),
                "DST_PORT": getattr(us, "port", ""),
                "RAW_LEN": str(len(data or b"")),
                "RAW_SHA256": _sha256_hex(data or b""),
                "RAW_HEX_PREFIX": _hex_prefix(raw, n=256),
                "RAW_B64_PREFIX": _b64_prefix(raw, n=768),
                "RAW_PRINTABLE_RATIO": f"{pr:.3f}",
                "HAS_NUL": "1" if (b"\x00" in raw) else "0",
                "HAS_HIGHBIT": "1" if any((c >= 0x80) for c in raw) else "0",
                "LOCALVERSION": _b2s(getattr(self, "ourVersionString", b"")),
                "REMOTEVERSION": _b2s(getattr(self, "otherVersionString", b"")),
                "CONN_ID": self._conn_id,
            }
        )

    def ssh_KEXINIT(self, packet):
        try:
            cookie = packet[:16]
            rest = packet[16:]

            kex, rest = _get_ns(rest)
            hostkey, rest = _get_ns(rest)
            c2s_cipher, rest = _get_ns(rest)
            s2c_cipher, rest = _get_ns(rest)
            c2s_mac, rest = _get_ns(rest)
            s2c_mac, rest = _get_ns(rest)
            c2s_comp, rest = _get_ns(rest)
            s2c_comp, rest = _get_ns(rest)
            c2s_lang, rest = _get_ns(rest)
            s2c_lang, rest = _get_ns(rest)

            first_follows = int(rest[0]) if rest else 0

            peer = self.transport.getPeer()
            us = self.transport.getHost()

            log.msg(
                {
                    "EVENT": "KEXINIT",
                    "SRC_HOST": getattr(peer, "host", ""),
                    "SRC_PORT": getattr(peer, "port", ""),
                    "DST_HOST": getattr(us, "host", ""),
                    "DST_PORT": getattr(us, "port", ""),
                    "KEX_COOKIE_B64": _b64_prefix(cookie, n=64),
                    "KEX_ALGS": _b2s(kex),
                    "HOST_KEY_ALGS": _b2s(hostkey),
                    "CIPHERS_C2S": _b2s(c2s_cipher),
                    "CIPHERS_S2C": _b2s(s2c_cipher),
                    "MACS_C2S": _b2s(c2s_mac),
                    "MACS_S2C": _b2s(s2c_mac),
                    "COMP_C2S": _b2s(c2s_comp),
                    "COMP_S2C": _b2s(s2c_comp),
                    "FIRST_KEX_PACKET_FOLLOWS": first_follows,
                    "LOCALVERSION": _b2s(getattr(self, "ourVersionString", b"")),
                    "REMOTEVERSION": _b2s(getattr(self, "otherVersionString", b"")),
                    "CONN_ID": self._conn_id,
                }
            )
        except Exception:
            pass

        return transport.SSHServerTransport.ssh_KEXINIT(self, packet)


class SimpleSSHFactory(factory.SSHFactory):
    def __init__(self, our_version_string):
        self.ourVersionString = our_version_string
        self.publicKeys, self.privateKeys = getHostKeyDicts()

    services = {
        b"ssh-userauth": CustomSSHUserAuthServer,
        b"ssh-connection": connection.SSHConnection,
    }

    def buildProtocol(self, addr):
        t = CustomSSHServerTransport(self.ourVersionString)
        try:
            t.supportedPublicKeys = list(self.privateKeys.keys())
        except Exception:
            t.supportedPublicKeys = self.privateKeys.keys()
        t.factory = self
        return t


class LoggingPasswordChecker:
    credentialInterfaces = [credentials.IUsernamePassword]

    def requestAvatarId(self, creds):
        log.msg(f"Login attempt - Username: {creds.username}, Password: {creds.password}")
        return defer.fail(error.UnauthorizedLogin())


class SQLAlchemyObserver:
    def __init__(self, db):
        self.db = db

    def __call__(self, event):
        session = None
        try:
            # Twisted may send non-dicts
            if not isinstance(event, dict):
                return

            if "EVENT" not in event:
                return

            print("✔ DB EVENT:", event)

            self.db.insert_log(event)

        except Exception as e:
            print("Observer Error:", e)

        finally:
            if session:
                session.close()

from twisted.python import log

def main():
    db = Database()

    sql_observer = SQLAlchemyObserver(db)


    from twisted.python import log
    log.addObserver(sql_observer)

    observer = log.PythonLoggingObserver()
    observer.start()

    ssh_factory = SimpleSSHFactory("SSH-2.0-OpenSSH_7.4")
    ssh_realm = SimpleSSHRealm()
    ssh_portal = portal.Portal(ssh_realm)
    ssh_portal.registerChecker(LoggingPasswordChecker())
    ssh_factory.portal = ssh_portal

    endpoint = endpoints.TCP4ServerEndpoint(reactor, 2222, interface="0.0.0.0")
    endpoint.listen(ssh_factory)

    reactor.run()
