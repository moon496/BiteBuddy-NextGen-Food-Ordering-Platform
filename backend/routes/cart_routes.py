from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/cart", tags=["Cart"])


cart_db: dict[int, list[dict]] = {}


MENU_ITEMS = [
    {"id": 1, "name": "Burger", "price": 120, "category": "Fast Food", "image": "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=500"},
    {"id": 2, "name": "Pizza", "price": 250, "category": "Italian","image": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500"},
    {"id": 3, "name": "Pasta", "price": 180, "category": "Italian","image": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500"},
    {"id": 4, "name": "Salad", "price": 90, "category": "Healthy","image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500"},
    {"id": 5, "name": "MeatBox", "price": 120, "category": "Testy Food", "image": "https://images.unsplash.com/photo-1767065703791-ddc9a028563c?q=80&w=500"},
    {"id": 6, "name": "Ice-cream", "price": 100, "category": "Fast Food","image": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=500"},
    {"id": 7, "name": "Sushi", "price": 200, "category": "Healthy","image": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?q=80&w=500"},
    {"id": 8, "name": "Fried-Rice", "price": 150, "category": "Fast Food","image": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500"},
    {"id": 9, "name": "Double Cheeseburger", "price": 320, "category": "Burgers","image": "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=500"},
    {"id": 10, "name": "Mango Lassi", "price": 120, "category": "Drinks","image": "https://images.unsplash.com/photo-1719239948819-0afeced16184?q=80&w=500"},
    {"id": 11, "name": "Spicy Ramen Bowl", "price": 280, "category": "Noodles", "image": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=500"},
    {"id": 12, "name": "Chicken Tacos", "price": 260, "category": "Mexican","image": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=500"}
]


class CartItemCreate(BaseModel):
    user_id: int
    item_id: int
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


def find_menu_item(item_id: int):
    return next((m for m in MENU_ITEMS if m["id"] == item_id), None)


def serialize_cart_item(entry: dict) -> dict:
    item = find_menu_item(entry["item_id"])
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
def get_cart(user_id: int):
    items = cart_db.get(user_id, [])
    return {"items": [serialize_cart_item(e) for e in items]}


@router.post("", status_code=201)
def add_to_cart(payload: CartItemCreate):
    item = find_menu_item(payload.item_id)
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

    return serialize_cart_item(existing)


@router.put("/{user_id}/{cart_item_id}")
def update_cart_item(user_id: int, cart_item_id: int, payload: CartItemUpdate):
    user_cart = cart_db.get(user_id, [])
    entry = next((e for e in user_cart if e["id"] == cart_item_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if payload.quantity <= 0:
        raise HTTPException(status_code=400, detail="Invalid quantity")

    entry["quantity"] = payload.quantity
    return serialize_cart_item(entry)



@router.delete("/{user_id}/{cart_item_id}")
def delete_cart_item(user_id: int, cart_item_id: int):
    user_cart = cart_db.get(user_id, [])
    entry = next((e for e in user_cart if e["id"] == cart_item_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Cart item not found")

    user_cart.remove(entry)
    return {"message": "Item removed from cart"}