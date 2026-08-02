from pydantic import BaseModel, Field
from typing import Optional

class CartItemCreate(BaseModel):
    item_id: int = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0)

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

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