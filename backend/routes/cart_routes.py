from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from model import MenuItem

router = APIRouter(prefix="/cart", tags=["Cart"])

cart_db: dict[int, list[dict]] = {}


class CartItemCreate(BaseModel):
    user_id: int = Field(..., gt=0)
    item_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)


def find_menu_item(item_id: int, db: Session):
    item = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not item:
        return None
    return {
        "id": item.id,
        "name": item.name,
        "price": item.price,
        "category": item.category,
        "image": item.image,
    }


def serialize_cart_item(entry: dict, db: Session) -> dict:
    item = find_menu_item(entry["item_id"], db)
    price = item["price"] if item else 0

    return {
        "id": entry["id"],
        "item_id": entry["item_id"],
        "item_name": item["name"] if item else None,
        "category": item["category"] if item else "",
        "image": item["image"] if item else "",
        "price": price,
        "quantity": entry["quantity"],
        "subtotal": price * entry["quantity"],
    }


@router.get("/{user_id}")
def get_cart(user_id: int, db: Session = Depends(get_db)):
    items = cart_db.get(user_id, [])
    return {"items": [serialize_cart_item(e, db) for e in items]}


@router.post("", status_code=201)
def add_to_cart(payload: CartItemCreate, db: Session = Depends(get_db)):
    item = find_menu_item(payload.item_id, db)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    user_cart = cart_db.setdefault(payload.user_id, [])
    existing = next((e for e in user_cart if e["item_id"] == payload.item_id), None)
    if existing:
        existing["quantity"] += payload.quantity
    else:
        new_id = (max([e["id"] for e in user_cart], default=0)) + 1
        existing = {"id": new_id, "item_id": payload.item_id, "quantity": payload.quantity}
        user_cart.append(existing)

    return serialize_cart_item(existing, db)


@router.put("/{user_id}/{cart_item_id}")
def update_cart_item(user_id: int, cart_item_id: int, payload: CartItemUpdate, db: Session = Depends(get_db)):
    user_cart = cart_db.get(user_id, [])
    entry = next((e for e in user_cart if e["id"] == cart_item_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Cart item not found")
    entry["quantity"] = payload.quantity
    return serialize_cart_item(entry, db)


@router.delete("/{user_id}/{cart_item_id}")
def delete_cart_item(user_id: int, cart_item_id: int, db: Session = Depends(get_db)):
    user_cart = cart_db.get(user_id, [])
    entry = next((e for e in user_cart if e["id"] == cart_item_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Cart item not found")
    user_cart.remove(entry)
    return {"message": "Item removed from cart"}