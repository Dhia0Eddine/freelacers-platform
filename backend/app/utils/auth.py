from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import Config
from app.models.user import User
from app.dependencies.db import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

SECRET_KEY = Config.JWT_SECRET
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        if user.status != "enabled":
            raise HTTPException(status_code=403, detail="User account is disabled")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def verify_token_ws(token: str):
    """Verify JWT token for WebSocket connections"""
    try:
        # Remove Bearer prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
            
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
            
        # Get user from database asynchronously
        async with async_session() as session:
            result = await session.execute(select(User).filter(User.email == username))
            user = result.scalars().first()
            if user is None:
                return None
            if user.status != "enabled":
                return None
                
        return user
    except JWTError:
        return None
    except Exception as e:
        logger.error(f"Error verifying token: {str(e)}")
        return None
