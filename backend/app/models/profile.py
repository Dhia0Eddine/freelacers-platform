from sqlalchemy import Column, Integer, String, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    full_name = Column(String, nullable=False)
    bio = Column(Text)
    location = Column(String)
    phone = Column(String)
    average_rating = Column(Float, default=0.0)
    profile_picture = Column(String, nullable=True)  # New field

    user = relationship("User", back_populates="profile")
    user = relationship("User", back_populates="profile")
