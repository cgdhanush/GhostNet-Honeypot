from sqlalchemy import Column, Integer, String, DateTime, Text, func
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class SSHLog(Base):
    __tablename__ = "ssh_logs"

    id = Column(Integer, primary_key=True)

    timestamp = Column(DateTime, server_default=func.now())

    event = Column(String(50))
    src_host = Column(String(100))
    src_port = Column(String(20))
    dst_host = Column(String(100))
    dst_port = Column(String(20))

    username = Column(String(100))
    method = Column(String(50))
    conn_id = Column(String(100))

    raw = Column(Text)  # store full event as JSON