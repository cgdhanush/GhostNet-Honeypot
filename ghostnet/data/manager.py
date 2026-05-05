from collections.abc import Mapping
import logging
import os
import threading

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import json

from ghostnet.data.model import Base, SSHLog

logger = logging.getLogger(__name__)


def safe_serialize(obj):
    """
    Convert non-JSON-serializable objects into safe representations.
    """
    if obj is None or isinstance(obj, (str, int, float, bool)):
        return obj

    if isinstance(obj, Mapping):
        return {k: safe_serialize(v) for k, v in obj.items()}

    if isinstance(obj, (list, tuple, set)):
        return [safe_serialize(i) for i in obj]

    # fallback: convert anything (Logger, Factory, object, etc.)
    return repr(obj)


class Database:
    def __init__(self):
        # Use absolute path to the database file in the project root
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        db_path = os.path.join(project_root, "ssh_honeypot.db")
        db_url = f"sqlite:///{db_path}"

        self.engine = create_engine(
            db_url,
            echo=False,
            connect_args={"check_same_thread": False},
        )

        Base.metadata.create_all(self.engine)

        self.SessionLocal = sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

        self._lock = threading.Lock()

    def insert_log(self, event: dict):
        session = self.SessionLocal()
        try:
            log_row = SSHLog(
                event=event.get("EVENT"),
                src_host=event.get("SRC_HOST"),
                src_port=str(event.get("SRC_PORT")),
                dst_host=event.get("DST_HOST"),
                dst_port=str(event.get("DST_PORT")),
                username=event.get("USERNAME"),
                method=event.get("METHOD"),
                conn_id=event.get("CONN_ID"),
                raw=json.dumps(event),
            )

            session.add(log_row)
            session.commit()
            print("✔ DB INSERT SUCCESS")

        except Exception as e:
            session.rollback()
            print("DB ERROR:", e)

        finally:
            session.close()
