from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin
import enum
from datetime import datetime

class BookingStatus(str, enum.Enum):
    scheduled = "scheduled"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"

class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.scheduled)
    created_at = Column(DateTime, default=datetime.utcnow)
    has_review = Column(Boolean, default=False)

    quote = relationship("Quote", back_populates="booking")
    customer = relationship("User", foreign_keys=[customer_id], back_populates="bookings_as_customer")
    provider = relationship("User", foreign_keys=[provider_id], back_populates="bookings_as_provider")
    review = relationship("Review", uselist=False, back_populates="booking")
    payment = relationship("Payment", uselist=False, back_populates="booking")
    listing = relationship("Listing", back_populates="bookings")
