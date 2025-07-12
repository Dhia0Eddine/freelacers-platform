from sqlalchemy import Column, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin
import enum

class BookingStatus(enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"

class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id", ondelete="CASCADE"))
    customer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    provider_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(Enum(BookingStatus), default=BookingStatus.scheduled)

    quote = relationship("Quote", back_populates="booking")
    customer = relationship("User", foreign_keys=[customer_id])
    provider = relationship("User", foreign_keys=[provider_id])
    review = relationship("Review", uselist=False, back_populates="booking")
    payment = relationship("Payment", uselist=False, back_populates="booking")
