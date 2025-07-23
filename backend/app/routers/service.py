# app/routers/service.py

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceOut
from app.models.category import Category
from app.dependencies.db import get_db

router = APIRouter(prefix="/services", tags=["Services"])

@router.post("/", response_model=ServiceOut, status_code=status.HTTP_201_CREATED)
async def create_service(
    name: str = Form(...),
    category_id: int = Form(...),
    description: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # Ensure category exists
    category = db.query(Category).get(category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    photo_path = None
    if photo:
        import os, shutil
        upload_dir = "static/service_pics"
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{name.replace(' ', '_')}_{photo.filename}"
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_path = f"/static/service_pics/{filename}"

    service = Service(
        name=name,
        description=description,
        category_id=category_id,
        photo=photo_path
    )
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
async def update_service(
    service_id: int,
    name: str = Form(None),
    category_id: int = Form(None),
    description: str = Form(None),
    photo: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    service = db.query(Service).get(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    if category_id is not None:
        category = db.query(Category).get(category_id)
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")
        service.category_id = category_id

    if name is not None:
        service.name = name
    if description is not None:
        service.description = description

    if photo:
        import os, shutil
        upload_dir = "static/service_pics"
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{service.name.replace(' ', '_')}_{photo.filename}"
        file_path = os.path.join(upload_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        service.photo = f"/static/service_pics/{filename}"

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
