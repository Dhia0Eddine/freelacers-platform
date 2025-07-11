from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
import enum
from datetime import datetime

class RequestStatus(str, enum.Enum):
    open = "open"
    quoted = "quoted"
    booked = "booked"
    closed = "closed"

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)

    description = Column(String)
    location = Column(String)
    preferred_date = Column(DateTime)
    status = Column(Enum(RequestStatus), default=RequestStatus.open)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="requests")
    service = relationship("Service", back_populates="requests")
    quotes = relationship("Quote", back_populates="request", cascade="all, delete")
    # Assuming Quote model exists and has a foreign key to Request
    # If not, you need to define the Quote model similarly to how Request is defined        