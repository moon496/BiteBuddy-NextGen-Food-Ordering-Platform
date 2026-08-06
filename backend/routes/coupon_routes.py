from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from model import User, UserCoupon
from auth_utils import decode_access_token
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/coupons", tags=["Coupons"])

# Seeded public coupon codes (usable by anyone)
COUPONS_DB = {
    "WELCOME10": {
        "code": "WELCOME10",
        "type": "percent",
        "value": 10,
        "max_discount": 150,
        "active": True,
    },
    "SAVE50": {
        "code": "SAVE50",
        "type": "flat",
        "value": 50,
        "active": True,
    },
    "BITEBUDDY20": {
        "code": "BITEBUDDY20",
        "type": "percent",
        "value": 20,
        "active": True,
    },
    "EXPIRED5": {
        "code": "EXPIRED5",
        "type": "percent",
        "value": 5,
        "active": False,
    },
}


class ApplyCouponRequest(BaseModel):
    code: str
    subtotal: float


def get_optional_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Like get_current_user, but returns None instead of raising when no/invalid token."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    try:
        payload = decode_access_token(token)
    except Exception:
        return None
    return db.query(User).filter(User.id == int(payload["sub"])).first()


def _calc_discount(discount_type: str, value: float, max_discount, subtotal: float):
    if discount_type == "percent":
        discount = subtotal * (value / 100)
        if max_discount is not None:
            discount = min(discount, max_discount)
        discount = round(discount, 2)
    elif discount_type == "flat":
        discount = min(value, subtotal)
    else:
        raise HTTPException(status_code=400, detail="Invalid coupon type")
    total = round(subtotal - discount, 2)
    return discount, total


@router.get("")
def list_coupons():
    return {"coupons": [c for c in COUPONS_DB.values() if c["active"]]}


@router.get("/my")
def my_coupons(current=Depends(get_current_user), db: Session = Depends(get_db)):
    user, _ = current
    coupons = (
        db.query(UserCoupon)
        .filter(UserCoupon.user_id == user.id, UserCoupon.used == "false")
        .all()
    )
    return [
        {
            "id": c.id,
            "code": c.code,
            "discount_type": c.discount_type,
            "value": c.value,
            "max_discount": c.max_discount,
        }
        for c in coupons
    ]


@router.post("/apply")
def apply_coupon(
    payload: ApplyCouponRequest,
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if payload.subtotal <= 0:
        raise HTTPException(status_code=400, detail="Subtotal must be greater than 0")

    code = payload.code.strip().upper()

    # 1. Check public coupons first
    coupon = COUPONS_DB.get(code)
    if coupon and coupon["active"]:
        discount, total = _calc_discount(
            coupon["type"], coupon["value"], coupon.get("max_discount"), payload.subtotal
        )
        return {
            "code": coupon["code"],
            "discount_type": coupon["type"],
            "discount_value": coupon["value"],
            "subtotal": payload.subtotal,
            "discount_amount": discount,
            "total": total,
        }

    # 2. Check user-specific coupons (requires logged-in user)
    if user:
        user_coupon = (
            db.query(UserCoupon)
            .filter(
                UserCoupon.user_id == user.id,
                UserCoupon.code == code,
                UserCoupon.used == "false",
            )
            .first()
        )
        if user_coupon:
            discount, total = _calc_discount(
                user_coupon.discount_type,
                user_coupon.value,
                user_coupon.max_discount,
                payload.subtotal,
            )
            return {
                "code": user_coupon.code,
                "discount_type": user_coupon.discount_type,
                "discount_value": user_coupon.value,
                "subtotal": payload.subtotal,
                "discount_amount": discount,
                "total": total,
                "user_coupon_id": user_coupon.id,
            }

    raise HTTPException(status_code=404, detail="Invalid or expired coupon code")


@router.post("/redeem/{user_coupon_id}")
def redeem_user_coupon(user_coupon_id: int, current=Depends(get_current_user), db: Session = Depends(get_db)):
    """Call this after a successful payment to mark a user-specific coupon as used."""
    user, _ = current
    coupon = (
        db.query(UserCoupon)
        .filter(UserCoupon.id == user_coupon_id, UserCoupon.user_id == user.id)
        .first()
    )
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    coupon.used = "true"
    db.commit()
    return {"message": "Coupon marked as used"}