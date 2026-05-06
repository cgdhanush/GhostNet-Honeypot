from datetime import datetime
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger(__name__)


class MongoHandler(logging.Handler):
    def __init__(self, collection):
        super().__init__()
        self.collection = collection
        self.setFormatter(jsonlogger.JsonFormatter())

    def emit(self, record):
        try:
            doc = record.__dict__.get("extra", {})
            doc["level"] = record.levelname
            doc["timestamp"] = datetime.fromtimestamp(record.created).isoformat()

            message = record.getMessage()
            for key, item in message:
                doc[key] = item

            self.collection.insert_one(doc)
        except Exception:
            pass
