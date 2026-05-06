import os
from dotenv import load_dotenv

load_dotenv()

CONFIG = {
    "verbosity": int(os.getenv("VERBOSITY", 0)),
    "print_colorized": os.getenv("PRINT_COLORIZED", "true").lower() == "true",

    "ssh_config": {
        "hostname": os.getenv("SSH_HOSTNAME", "0.0.0.0"),
        "port": int(os.getenv("SSH_PORT", 2222)),
        "version": os.getenv("SSH_VERSION", "SSH-2.0-OpenSSH_7.4"),
    },
}