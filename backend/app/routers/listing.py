from sqlalchemy import Column, Integer, String, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

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

    user = relationship("User", back_populates="listings")
    service = relationship("Service", back_populates="listings")
    quotes = relationship("Quote", back_populates="listing", cascade="all, delete")
