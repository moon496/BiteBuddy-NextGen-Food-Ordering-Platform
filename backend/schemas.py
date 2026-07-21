from pydantic import BaseModel
from typing import Optional

class CartItemCreate(BaseModel):
    item_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    user_id: int
    item_id: int
    item_name: Optional[str] = None
    price: Optional[float] = None
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True  