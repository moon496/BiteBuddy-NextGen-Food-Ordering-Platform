from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/coupons", tags=["Coupons"])

# Seeded coupon codes
COUPONS_DB = {
    "WELCOME10": {
        "code": "WELCOME10",
        "type": "percent",
        "value": 10,
        "max_discount": 150,  # Maximum discount is ৳150
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


@router.get("")
def list_coupons():
    return {
        "coupons": [
            coupon for coupon in COUPONS_DB.values() if coupon["active"]
        ]
    }


@router.post("/apply")
def apply_coupon(payload: ApplyCouponRequest):
    coupon = COUPONS_DB.get(payload.code.strip().upper())

    if not coupon or not coupon["active"]:
        raise HTTPException(
            status_code=404,
            detail="Invalid or expired coupon code"
        )

    if payload.subtotal <= 0:
        raise HTTPException(
            status_code=400,
            detail="Subtotal must be greater than 0"
        )

    # Calculate discount
    if coupon["type"] == "percent":
        discount = payload.subtotal * (coupon["value"] / 100)

        # Apply maximum discount if specified
        if "max_discount" in coupon:
            discount = min(discount, coupon["max_discount"])

        discount = round(discount, 2)

    elif coupon["type"] == "flat":
        discount = min(coupon["value"], payload.subtotal)

    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid coupon type"
        )

    total = round(payload.subtotal - discount, 2)

    return {
        "code": coupon["code"],
        "discount_type": coupon["type"],
        "discount_value": coupon["value"],
        "subtotal": payload.subtotal,
        "discount_amount": discount,
        "total": total,
    }