# app/routers/service.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut
from app.models.category import Category
from app.dependencies.db import get_db

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
def create_service(data: ServiceCreate, db: Session = Depends(get_db)):
    # Ensure category exists
    category = db.query(Category).get(data.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    service = Service(name=data.name, description=data.description, category_id=data.category_id)
    db.add(service)
    db.commit()
    db.refresh(service)
    return service

@router.get("/", response_model=list[ServiceOut])
def list_services(db: Session = Depends(get_db)):
    return db.query(Service).all()

@router.get("/{service_id}", response_model=ServiceOut)
def get_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).get(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service

@router.put("/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, data: ServiceUpdate, db: Session = Depends(get_db)):
    service = db.query(Service).get(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    category = db.query(Category).get(data.category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    service.name = data.name
    service.description = data.description
    service.category_id = data.category_id
    db.commit()
    db.refresh(service)
    return service

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).get(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return None
