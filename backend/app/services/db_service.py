import logging
from pymongo import MongoClient

from backend.app.config.config import settings

logger = logging.getLogger(__name__)


class Manager:
    def __init__(self):
        self.client = MongoClient(settings.MONGODB_URI)
        db = self.client["ssh_logs"]
        self.collection = db["events"]

    def get_logs_collection(self):
        return self.collection
