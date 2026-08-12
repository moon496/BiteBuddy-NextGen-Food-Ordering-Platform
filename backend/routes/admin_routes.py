from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from database import get_db
from model import User, UserCoupon, Order, MenuItem
from routes.auth_routes import get_current_user
from auth_utils import hash_password

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

ORDER_STATUS_SEQUENCE = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]


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


# ---------- Orders (REAL DB now) ----------

@router.get("/orders")
def list_all_orders(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    return {
        "orders": [
            {
                "order_id": o.id,
                "user_id": o.user_id,
                "username": o.user.username if o.user else None,
                "status": o.status,
                "total_amount": o.total_amount,
                "payment_method": o.payment_method,   
                "payment_status": o.payment_status,
                "created_at": o.created_at.isoformat() + "Z",
                "items": [
                    {"item_name": i.item_name, "quantity": i.quantity, "price": i.price}
                    for i in o.items
                ],
            }
            for o in orders
        ],
        "status_sequence": ORDER_STATUS_SEQUENCE,
    }


@router.get("/orders/user/{user_id}")
def list_orders_by_user(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return [
        {
            "order_id": o.id,
            "status": o.status,
            "total_amount": o.total_amount,
            "created_at": o.created_at.isoformat() + "Z",
        }
        for o in orders
    ]


@router.patch("/orders/{order_id}/status")
def admin_update_order_status(order_id: int, body: StatusUpdate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.status not in ORDER_STATUS_SEQUENCE:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid status", "allowed_statuses": ORDER_STATUS_SEQUENCE},
        )

    order.status = body.status
    db.commit()
    return {"order_id": order.id, "status": order.status}


# ---------- Revenue ----------

@router.get("/revenue")
def get_revenue(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()

    today = datetime.utcnow().date()
    today_start = datetime(today.year, today.month, today.day)
    today_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        Order.created_at >= today_start
    ).scalar()

    month_start = datetime(today.year, today.month, 1)
    month_revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        Order.created_at >= month_start
    ).scalar()

    return {
        "total_revenue": total_revenue,
        "today_revenue": today_revenue,
        "month_revenue": month_revenue,
        "total_orders": total_orders,
    }


# ---------- Menu management ----------

class MenuItemCreate(BaseModel):
    name: str
    price: float
    category: str | None = None
    image: str | None = None


@router.get("/menu")
def admin_list_menu(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    items = db.query(MenuItem).all()
    return [
        {"id": m.id, "name": m.name, "price": m.price, "category": m.category, "image": m.image}
        for m in items
    ]


@router.post("/menu", status_code=201)
def admin_add_menu_item(payload: MenuItemCreate, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    item = MenuItem(**payload.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"message": f"{item.name} added to menu", "id": item.id}


@router.delete("/menu/{item_id}")
def admin_remove_menu_item(item_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    db.delete(item)
    db.commit()
    return {"message": "Menu item removed"}


# ---------- Admin management (অপরিবর্তিত) ----------

@router.get("/admins")
def list_admins(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    admins = db.query(User).filter(User.role == "Admin").all()
    return [{"id": a.id, "username": a.username, "email": a.email} for a in admins]


@router.post("/admins", status_code=201)
def add_admin(
    payload: AdminCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Check if username or email already exists
    existing = db.query(User).filter(
        (User.username == payload.username) |
        (User.email == payload.email)
    ).first()

    if existing:
        # Already an admin
        if existing.role == "Admin":
            raise HTTPException(
                status_code=400,
                detail="User is already an admin"
            )

        # Existing normal user → promote to Admin
        existing.role = "Admin"
        db.commit()
        db.refresh(existing)

        return {
            "message": f"{existing.username} promoted to Admin"
        }

    # Create a completely new admin
    new_admin = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role="Admin",
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    return {
        "message": f"New admin {new_admin.username} created"
    }

@router.patch("/orders/{order_id}/mark-paid")
def mark_order_paid(order_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.payment_status = "paid"
    db.commit()
    return {"order_id": order.id, "payment_status": order.payment_status}


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


# ---------- Coupon assignment (অপরিবর্তিত) ----------

class AssignCouponRequest(BaseModel):
    user_id: int
    code: str
    discount_type: str
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
# ---------- Fraud detection / Ban management ----------

@router.patch("/orders/{order_id}/mark-failed")
def mark_order_failed(order_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "Failed"
    db.commit()

    target_user = db.query(User).filter(User.id == order.user_id).first()
    if target_user:
        target_user.failed_delivery_count += 1
        if target_user.failed_delivery_count >= 3:
            target_user.is_banned = True
        db.commit()

    return {
        "order_id": order.id,
        "status": order.status,
        "user_id": target_user.id if target_user else None,
        "username": target_user.username if target_user else None,
        "failed_delivery_count": target_user.failed_delivery_count if target_user else None,
        "failed_delivery_count": target_user.failed_delivery_count if target_user else None,
        "is_banned": target_user.is_banned if target_user else None,
    }


@router.get("/banned-users")
def list_banned_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.is_banned == True).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "failed_delivery_count": u.failed_delivery_count,
        }
        for u in users
    ]


@router.patch("/users/{user_id}/unban")
def unban_user(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_banned = False
    user.failed_delivery_count = 0
    db.commit()
    return {"message": f"{user.username} has been unbanned"}
