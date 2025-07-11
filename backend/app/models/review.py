from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import TimestampMixin

class Review(Base, TimestampMixin):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    reviewee_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"))
    rating = Column(Integer, nullable=False)  # 1–5
    comment = Column(Text, nullable=True)

    booking = relationship("Booking", back_populates="review")
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    reviewee = relationship("User", foreign_keys=[reviewee_id])
