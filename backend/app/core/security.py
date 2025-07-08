# app/core/security.py

from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import Config

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT creation
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, Config.JWT_SECRET, algorithm=Config.ALGORITHM)

# JWT verification
def verify_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=[Config.ALGORITHM])
        return payload
    except JWTError:
        return None
