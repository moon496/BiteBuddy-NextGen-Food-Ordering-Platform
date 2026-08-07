"""
Simulated payment integration for Payment Integration (#28).

Real bKash/card integration needs merchant sandbox API keys, which this
student project doesn't have yet. This mocks the same flow a real gateway
uses: initiate -> redirect/callback -> confirm -> update order status,
so it's a drop-in swap later (replace call_bkash_gateway()).
"""
import random
import uuid

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from model import Order

router = APIRouter(prefix="/payments", tags=["Payments"])

# payment_id -> payment record (payments still simulated / not in DB)
PAYMENTS_DB: dict[str, dict] = {}


class InitiatePaymentRequest(BaseModel):
    order_id: int
    amount: float = Field(..., gt=0)
    method: str = Field(..., pattern="^(bkash|card|cod)$")


class CallbackRequest(BaseModel):
    force_result: str | None = Field(
        default=None,
        pattern="^(success|failure)$"
    )  # "success" | "failure", optional override for testing


def call_bkash_gateway() -> bool:
    """
    Placeholder for a real gateway call (e.g. bKash Checkout API).
    Swap this out for a real HTTP call once you have sandbox credentials.
    Simulates ~80% success rate.
    """
    return random.random() < 0.8


@router.post("/initiate", status_code=201)
def initiate_payment(payload: InitiatePaymentRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.method not in ("bkash", "card", "cod"):
        raise HTTPException(status_code=400, detail="Unsupported payment method")

    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0")

    payment_id = str(uuid.uuid4())[:8]
    PAYMENTS_DB[payment_id] = {
        "payment_id": payment_id,
        "order_id": payload.order_id,
        "amount": payload.amount,
        "method": payload.method,
        "status": "pending",
    }
    return PAYMENTS_DB[payment_id]


@router.post("/{payment_id}/callback")
def payment_callback(payment_id: str, body: CallbackRequest = CallbackRequest(), db: Session = Depends(get_db)):
    """
    Simulates the gateway calling us back after the user pays.
    In real bKash/card integration, this endpoint is what the gateway hits
    (or the frontend polls) with a signed confirmation of success/failure.
    """
    payment = PAYMENTS_DB.get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment["status"] != "pending":
        raise HTTPException(status_code=400, detail="Payment already processed")

    if body.force_result == "success":
        succeeded = True
    elif body.force_result == "failure":
        succeeded = False
    else:
        succeeded = call_bkash_gateway()

    if succeeded:
        payment["status"] = "paid"
        order = db.query(Order).filter(Order.id == payment["order_id"]).first()
        if order:
            order.status = "Confirmed"
            db.commit()
    else:
        payment["status"] = "failed"

    return payment


@router.get("/{payment_id}")
def get_payment(payment_id: str):
    payment = PAYMENTS_DB.get(payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment