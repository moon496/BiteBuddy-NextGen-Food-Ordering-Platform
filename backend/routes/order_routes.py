from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from model import Order, OrderItem, UserCoupon
from routes.cart_routes import cart_db, find_menu_item

router = APIRouter(prefix="/orders", tags=["Orders"])

ORDER_STATUS_SEQUENCE = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered"]


class StatusUpdate(BaseModel):
    status: str


@router.post("/create", status_code=201)
def create_order(user_id: int, address_id: int | None = None, db: Session = Depends(get_db)):
    user_cart = cart_db.get(user_id, [])
    if not user_cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total = 0
    order_items_data = []
    for entry in user_cart:
        item = find_menu_item(entry["item_id"], db)
        if not item:
            continue
        subtotal = item["price"] * entry["quantity"]
        total += subtotal
        order_items_data.append({
            "item_id": entry["item_id"],
            "item_name": item["name"],
            "quantity": entry["quantity"],
            "price": item["price"],
        })

    new_order = Order(user_id=user_id, address_id=address_id, total_amount=total, status="Pending")
    db.add(new_order)
    db.flush()

    for data in order_items_data:
        db.add(OrderItem(order_id=new_order.id, **data))

    db.commit()
    db.refresh(new_order)

    cart_db[user_id] = []

    return {"message": "Order placed", "order_id": new_order.id, "total": total}


@router.get("/user/{user_id}")
def list_orders(user_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return {
        "orders": [
            {
                "id": o.id,
                "status": o.status,
                "total_amount": o.total_amount,
                "created_at": o.created_at.isoformat() + "Z",
            }
            for o in orders
        ]
    }


@router.get("/{order_id}/status")
def get_order_status(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order.id,
        "status": order.status,
        "status_sequence": ORDER_STATUS_SEQUENCE,
        "current_step": ORDER_STATUS_SEQUENCE.index(order.status),
    }


@router.patch("/{order_id}/status")
def update_order_status(order_id: int, body: StatusUpdate, db: Session = Depends(get_db)):
    if body.status not in ORDER_STATUS_SEQUENCE:
        raise HTTPException(status_code=400, detail={"error": "Invalid status", "allowed": ORDER_STATUS_SEQUENCE})

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = body.status
    db.commit()

    if body.status == "Delivered":
        delivered_count = (
            db.query(Order)
            .filter(Order.user_id == order.user_id, Order.status == "Delivered")
            .count()
        )
        if delivered_count % 3 == 0:
            loyalty_coupon = UserCoupon(
                user_id=order.user_id,
                code=f"LOYAL15-{delivered_count}",
                discount_type="percent",
                value=15,
                max_discount=250,
                used="false",
            )
            db.add(loyalty_coupon)
            db.commit()
            
    return {"order_id": order_id, "status": body.status}


@router.get("/{order_id}")
def get_order_detail(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    return {
        "id": order.id,
        "status": order.status,
        "total_amount": order.total_amount,
        "items": [{"name": i.item_name, "quantity": i.quantity, "price": i.price} for i in items],
    }