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
            doc["timestamp"] = datetime.now().isoformat()

            message = record.msg

            if isinstance(message, dict):
                for key, value in message.items():
                    doc[key] = value
            else:
                doc["message"] = record.getMessage()

            self.collection.insert_one(doc)
        except Exception as e:
           logger.error("MongoHandler error:", e, exc_info=True)
