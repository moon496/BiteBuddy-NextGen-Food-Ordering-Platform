from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from order_status import ORDERS_DB, ORDER_STATUS_SEQUENCE
from database import get_db
from model import User
from routes.auth_routes import get_current_user
from auth_utils import hash_password
from model import User, UserCoupon

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


class StatusUpdate(BaseModel):
    status: str


class AdminCreateRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


def require_admin(current=Depends(get_current_user)):
    user, _ = current
    if user.role != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------- Orders ----------

@router.get("/orders")
def list_all_orders(admin: User = Depends(require_admin)):
    """Returns every order in the system, for the restaurant staff dashboard."""
    return {"orders": list(ORDERS_DB.values()), "status_sequence": ORDER_STATUS_SEQUENCE}


@router.patch("/orders/{order_id}/status")
def admin_update_order_status(order_id: str, body: StatusUpdate, admin: User = Depends(require_admin)):
    order = ORDERS_DB.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.status not in ORDER_STATUS_SEQUENCE:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid status", "allowed_statuses": ORDER_STATUS_SEQUENCE},
        )

    order["status"] = body.status
    return order


# ---------- Admin management ----------

@router.get("/admins")
def list_admins(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    admins = db.query(User).filter(User.role == "Admin").all()
    return [{"id": a.id, "username": a.username, "email": a.email} for a in admins]


@router.post("/admins", status_code=201)
def add_admin(payload: AdminCreateRequest, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    if existing:
        if existing.role == "Admin":
            raise HTTPException(status_code=400, detail="User is already an admin")
        existing.role = "Admin"
        db.commit()
        return {"message": f"{existing.username} promoted to Admin"}

    new_admin = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="Admin",
    )
    db.add(new_admin)
    db.commit()
    return {"message": f"New admin {payload.username} created"}


@router.delete("/admins/{admin_id}")
def remove_admin(admin_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if admin_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot remove yourself")

    target = db.query(User).filter(User.id == admin_id, User.role == "Admin").first()
    if not target:
        raise HTTPException(status_code=404, detail="Admin not found")

    target.role = "User"
    db.commit()
    return {"message": f"{target.username} removed from Admin"}


    # ---------- Coupon assignment ----------

class AssignCouponRequest(BaseModel):
    user_id: int
    code: str
    discount_type: str   # "percent" or "flat"
    value: float
    max_discount: float | None = None


@router.post("/coupons", status_code=201)
def assign_coupon(payload: AssignCouponRequest, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    target_user = db.query(User).filter(User.id == payload.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.discount_type not in ("percent", "flat"):
        raise HTTPException(status_code=400, detail="discount_type must be 'percent' or 'flat'")

    coupon = UserCoupon(
        user_id=payload.user_id,
        code=payload.code.strip().upper(),
        discount_type=payload.discount_type,
        value=payload.value,
        max_discount=payload.max_discount,
        used="false",
    )
    db.add(coupon)
    db.commit()
    return {"message": f"Coupon {coupon.code} assigned to {target_user.username}"}


@router.get("/coupons")
def list_assigned_coupons(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    coupons = db.query(UserCoupon).all()
    return [
        {
            "id": c.id,
            "user_id": c.user_id,
            "username": c.user.username,
            "code": c.code,
            "discount_type": c.discount_type,
            "value": c.value,
            "used": c.used == "true",
        }
        for c in coupons
    ]


@router.delete("/coupons/{coupon_id}")
def remove_assigned_coupon(coupon_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    coupon = db.query(UserCoupon).filter(UserCoupon.id == coupon_id).first()
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    db.delete(coupon)
    db.commit()
    return {"message": "Coupon removed"}