from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from order_status import ORDERS_DB, ORDER_STATUS_SEQUENCE

router = APIRouter(prefix="/admin/orders", tags=["Admin Dashboard"])


class StatusUpdate(BaseModel):
    status: str


@router.get("")
def list_all_orders():
    """Returns every order in the system, for the restaurant staff dashboard."""
    return {"orders": list(ORDERS_DB.values()), "status_sequence": ORDER_STATUS_SEQUENCE}


@router.patch("/{order_id}/status")
def admin_update_order_status(order_id: str, body: StatusUpdate):
    order = ORDERS_DB.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")

    if body.status not in ORDER_STATUS_SEQUENCE:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid status", "allowed_statuses": ORDER_STATUS_SEQUENCE},
        )

    order["status"] = body.status
    return order
