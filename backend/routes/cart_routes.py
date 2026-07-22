from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/cart", tags=["Cart"])


cart_db: dict[int, list[dict]] = {}


MENU_ITEMS = [
    {"id": 1, "name": "Burger", "price": 120, "category": "Fast Food"},
    {"id": 2, "name": "Pizza", "price": 250, "category": "Italian"},
    {"id": 3, "name": "Pasta", "price": 180, "category": "Italian"},
    {"id": 4, "name": "Salad", "price": 90, "category": "Healthy"},
    {"id": 5, "name": "MeatBox", "price": 120, "category": "Testy Food"},
    {"id": 6, "name": "Ice-cream", "price": 100, "category": "Fast Food"},
    {"id": 7, "name": "Sushi", "price": 200, "category": "Healthy"},
    {"id": 8, "name": "Fried-Rice", "price": 150, "category": "Fast Food"}
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