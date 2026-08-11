from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
import jwt


from database import get_db
from datetime import datetime
import logging

from model import User, UserCoupon
from auth_schemas import RegisterRequest, LoginRequest, UserResponse, UpdateUserRequest
from auth_utils import hash_password, verify_password, create_access_token, decode_access_token

logger = logging.getLogger("bitebuddy.admin")

router = APIRouter(prefix="/auth", tags=["Auth"])

token_blocklist: set[str] = set()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    welcome_coupon = UserCoupon(
        user_id=user.id,
        code="WELCOME20",
        discount_type="percent",
        value=20,
        max_discount=200,
        used="false",
    )
    db.add(welcome_coupon)
    db.commit()

    return user


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if user.is_banned:
        raise HTTPException(
            status_code=403,
            detail="Your account has been banned due to repeated delivery failures. Please contact support.",
        )

    token = create_access_token({"sub": str(user.id), "username": user.username})

    if user.role == "Admin":
        msg = f"🔔 ADMIN LOGIN — {user.username} ({user.email}) at {datetime.utcnow()} UTC"
        logger.warning(msg)
        print(msg)

    token = create_access_token({"sub": str(user.id), "username": user.username})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "username": user.username, "email": user.email, "role": user.role},
    }


# get_current_user MUST be defined here, before any route below uses it as a Depends default
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ")[1]
    if token in token_blocklist:
        raise HTTPException(status_code=401, detail="Token has been logged out")

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user, token


@router.get("/me")
def get_me(current=Depends(get_current_user)):
    user, _ = current
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role}


@router.post("/logout")
def logout(current=Depends(get_current_user)):
    _, token = current
    token_blocklist.add(token)
    return {"message": "Logged out successfully"}


@router.put("/me", response_model=UserResponse)
def update_me(payload: UpdateUserRequest, current=Depends(get_current_user), db: Session = Depends(get_db)):
    user, _ = current

    existing = db.query(User).filter(
        ((User.username == payload.username) | (User.email == payload.email))
        & (User.id != user.id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already in use")

    db_user = db.query(User).filter(User.id == user.id).first()
    db_user.username = payload.username
    db_user.email = payload.email
    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/me")
def delete_me(current=Depends(get_current_user), db: Session = Depends(get_db)):
    user, _ = current
    db_user = db.query(User).filter(User.id == user.id).first()
    db.delete(db_user)
    db.commit()
    return {"message": "Account deleted successfully"}