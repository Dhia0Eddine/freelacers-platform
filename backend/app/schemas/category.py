from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    description: Optional[str]

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        
        # This allows Pydantic to read data as dictionaries from ORM models
        # and convert them to Pydantic models.
        # It is useful when you want to serialize SQLAlchemy models directly.