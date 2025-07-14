from sqlalchemy import Column, Integer, String, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    full_name = Column(String)
    location = Column(String)
    bio = Column(String)
    average_rating = Column(Float)
    phone = Column(String)

    user = relationship("User", back_populates="profile")
