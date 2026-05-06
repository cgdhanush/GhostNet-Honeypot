import logging
from pymongo import MongoClient

logger = logging.getLogger(__name__)


class Manager:
    def __init__(self):
        self.__client = MongoClient(
            "mongodb://admin:admin1234@127.0.0.1:27017/?authSource=admin"
        )

    def get_client(self):
        return self.__client