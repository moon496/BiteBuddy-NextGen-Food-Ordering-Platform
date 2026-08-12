from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from model import User, UserCoupon, Order
from auth_utils import decode_access_token
from routes.auth_routes import get_current_user

router = APIRouter(prefix="/coupons", tags=["Coupons"])

# Seeded public coupon codes (usable by anyone)
COUPONS_DB = {
    "WELCOME30": {
        "code": "WELCOME30",
        "type": "percent",
        "value": 30,
        "max_discount": None,
        "active": True,
        "new_user_only": True,
    },
    "SAVE50": {
        "code": "SAVE50",
        "type": "flat",
        "value": 50,
        "active": True,
        "new_user_only": False,
    },
    "BITEBUDDY20": {
        "code": "BITEBUDDY20",
        "type": "percent",
        "value": 20,
        "active": True,
        "new_user_only": False,
    },
    "EXPIRED5": {
        "code": "EXPIRED5",
        "type": "percent",
        "value": 5,
        "active": False,
        "new_user_only": False,
    },
}


class ApplyCouponRequest(BaseModel):
    code: str
    subtotal: float


def is_new_user(user: User | None, db: Session) -> bool:
    """
    A user is considered new if they have never placed an order.
    """
    if not user:
        return False

    existing_order = (
        db.query(Order)
        .filter(Order.user_id == user.id)
        .first()
    )

    return existing_order is None


def get_optional_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """
    Like get_current_user, but returns None instead of raising
    when there is no or invalid token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ", 1)[1]

    try:
        payload = decode_access_token(token)
    except Exception:
        return None

    user_id = payload.get("sub")

    if not user_id:
        return None

    return db.query(User).filter(User.id == int(user_id)).first()


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

@router.post("/best")
def best_coupon(
    payload: ApplyCouponRequest,
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if payload.subtotal <= 0:
        raise HTTPException(
            status_code=400,
            detail="Subtotal must be greater than 0"
        )

    candidates = []

    # Check whether this user has ever placed an order.
    new_user = is_new_user(user, db)

    # 1. Public coupons
    for coupon in COUPONS_DB.values():
        if not coupon["active"]:
            continue

        # WELCOME30 is only available to new users.
        if coupon.get("new_user_only", False) and not new_user:
            continue

        discount, total = _calc_discount(
            coupon["type"],
            coupon["value"],
            coupon.get("max_discount"),
            payload.subtotal,
        )

        candidates.append({
            "code": coupon["code"],
            "discount_type": coupon["type"],
            "discount_value": coupon["value"],
            "discount_amount": discount,
            "total": total,
            "user_coupon_id": None,
        })

    # 2. User-specific coupons
    if user:
        user_coupons = (
            db.query(UserCoupon)
            .filter(
                UserCoupon.user_id == user.id,
                UserCoupon.used == "false",
            )
            .all()
        )

        for coupon in user_coupons:
            discount, total = _calc_discount(
                coupon.discount_type,
                coupon.value,
                coupon.max_discount,
                payload.subtotal,
            )

            candidates.append({
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.value,
                "discount_amount": discount,
                "total": total,
                "user_coupon_id": coupon.id,
            })

    if not candidates:
        return {
            "best_coupon": None,
            "message": "No eligible coupons available.",
        }

    best = max(
        candidates,
        key=lambda coupon: coupon["discount_amount"]
    )

    return {
        "best_coupon": best,
        "all_coupons": candidates,
    }

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
    # Add the public new-user coupon only for users
    # who have never placed an order.
    if is_new_user(user, db):
        welcome_coupon = COUPONS_DB.get("WELCOME30")

        if welcome_coupon and welcome_coupon["active"]:
            result.insert(0, {
                "id": None,
                "code": welcome_coupon["code"],
                "discount_type": welcome_coupon["type"],
                "value": welcome_coupon["value"],
                "max_discount": welcome_coupon.get("max_discount"),
            })

    return result


@router.post("/apply")
def apply_coupon(
    payload: ApplyCouponRequest,
    user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if payload.subtotal <= 0:
        raise HTTPException(
            status_code=400,
            detail="Subtotal must be greater than 0"
        )

    code = payload.code.strip().upper()

    # 1. Check public coupons first
    coupon = COUPONS_DB.get(code)

    if coupon and coupon["active"]:

        # New-user-only coupon validation
        if coupon.get("new_user_only", False):

            if not user:
                raise HTTPException(
                    status_code=401,
                    detail="Please log in to use this coupon."
                )

            if not is_new_user(user, db):
                raise HTTPException(
                    status_code=403,
                    detail="This coupon is only available for new users."
                )

        discount, total = _calc_discount(
            coupon["type"],
            coupon["value"],
            coupon.get("max_discount"),
            payload.subtotal,
        )

        return {
            "code": coupon["code"],
            "discount_type": coupon["type"],
            "discount_value": coupon["value"],
            "subtotal": payload.subtotal,
            "discount_amount": discount,
            "total": total,
        }

    # 2. Check user-specific coupons
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

    raise HTTPException(
        status_code=404,
        detail="Invalid or expired coupon code"
    )

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
@router.get("/welcome")
def welcome_coupon(
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user, _ = current

    if not is_new_user(user, db):
        return {
            "available": False,
            "coupon": None
        }

    coupon = COUPONS_DB.get("WELCOME30")

    if not coupon or not coupon["active"]:
        return {
            "available": False,
            "coupon": None
        }

    return {
        "available": True,
        "coupon": {
            "code": coupon["code"],
            "discount_type": coupon["type"],
            "value": coupon["value"],
            "max_discount": coupon.get("max_discount")
        },
    }