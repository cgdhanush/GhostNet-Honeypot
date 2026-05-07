import os
from dotenv import load_dotenv

load_dotenv()

CONFIG = {
    "verbosity": 0,
    "print_colorized": True,
    "ssh_config": {
        "hostname": "0.0.0.0",
        "port": 2222,
        "version": "SSH-2.0-OpenSSH_7.4",
    },
    "api_server": {
        "listen_ip_address": "0.0.0.0",
        "listen_port": 8000,
        "CORS_origins": [],
    },
    "mongodb": {
        "uri": os.getenv("MONGODB_URI", "mongodb://localhost:27017"),
        "db": os.getenv("MONGODB_DB", "honeyfot"),
        "event_db": os.getenv("MONGODB_EVENT_DB", "ssh_logs"),
    },
}
