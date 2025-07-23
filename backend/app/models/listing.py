from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(String)
    min_price = Column(Float)
    max_price = Column(Float)
    location = Column(String)
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)

    user = relationship("User", back_populates="listings")
    service = relationship("Service", back_populates="listings", passive_deletes=True)
    quotes = relationship("Quote", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True)
    requests = relationship("Request", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True)
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan", passive_deletes=True)