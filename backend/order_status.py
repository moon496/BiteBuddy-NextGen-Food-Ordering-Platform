from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

ORDER_STATUS_SEQUENCE = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Out for Delivery",
    "Delivered",
]

ORDERS_DB = {
    "1001": {"order_id": "1001", "status": "Preparing"},
    "1002": {"order_id": "1002", "status": "Delivered"},
    "1003": {"order_id": "1003", "status": "Pending"},
}


class StatusUpdate(BaseModel):
    status: str


@router.get("/orders/{order_id}/status")
def get_order_status(order_id: str):
    order = ORDERS_DB.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    return {
        "order_id": order["order_id"],
        "status": order["status"],
        "status_sequence": ORDER_STATUS_SEQUENCE,
        "current_step": ORDER_STATUS_SEQUENCE.index(order["status"]),
    }


@router.patch("/orders/{order_id}/status")
def update_order_status(order_id: str, body: StatusUpdate):
    order = ORDERS_DB.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.status not in ORDER_STATUS_SEQUENCE:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid status", "allowed_statuses": ORDER_STATUS_SEQUENCE},
        )

    order["status"] = body.status
    return {"order_id": order_id, "status": body.status}