from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from model import Review, Order, OrderItem

router = APIRouter(prefix="/reviews", tags=["Reviews"])


class ReviewCreate(BaseModel):
    order_id: int
    item_id: int
    user_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = ""


def _serialize(r: Review) -> dict:
    return {
        "id": r.id,
        "order_id": r.order_id,
        "item_id": r.item_id,
        "rating": r.rating,
        "comment": r.comment,
        "created_at": r.created_at.isoformat() + "Z" if r.created_at else None,
    }


@router.get("/{item_id}")
def get_reviews(item_id: int, db: Session = Depends(get_db)):
    reviews = (
        db.query(Review)
        .filter(Review.item_id == item_id)
        .order_by(Review.created_at.desc())
        .all()
    )
    average = round(sum(r.rating for r in reviews) / len(reviews), 1) if reviews else 0
    return {
        "item_id": item_id,
        "average_rating": average,
        "count": len(reviews),
        "reviews": [_serialize(r) for r in reviews],
    }


@router.get("/reviewable/{user_id}")
def get_reviewable_items(user_id: int, db: Session = Depends(get_db)):
    """Orders placed by this user, with their items, flagged as already-reviewed or not.

    Used by the review form so people pick a real order instead of typing a name.
    """
    orders = (
        db.query(Order)
        .filter(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
        .all()
    )

    already_reviewed = {
        (r.order_id, r.item_id)
        for r in db.query(Review).filter(Review.user_id == user_id).all()
    }

    result = []
    for order in orders:
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        result.append({
            "order_id": order.id,
            "status": order.status,
            "created_at": order.created_at.isoformat() + "Z" if order.created_at else None,
            "items": [
                {
                    "item_id": oi.item_id,
                    "item_name": oi.item_name,
                    "quantity": oi.quantity,
                    "already_reviewed": (order.id, oi.item_id) in already_reviewed,
                }
                for oi in order_items
            ],
        })
    return {"orders": result}


@router.post("", status_code=201)
def add_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != payload.user_id:
        raise HTTPException(status_code=403, detail="This order does not belong to you")

    order_item = (
        db.query(OrderItem)
        .filter(OrderItem.order_id == payload.order_id, OrderItem.item_id == payload.item_id)
        .first()
    )
    if not order_item:
        raise HTTPException(status_code=400, detail="That item was not part of this order")

    existing = (
        db.query(Review)
        .filter(Review.order_id == payload.order_id, Review.item_id == payload.item_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already reviewed this item for this order")

    review = Review(
        order_id=payload.order_id,
        item_id=payload.item_id,
        user_id=payload.user_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return _serialize(review)


@router.delete("/{review_id}")
def delete_review(review_id: int, user_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    if review.user_id != user_id:
        raise HTTPException(status_code=403, detail="This review does not belong to you")

    db.delete(review)
    db.commit()
    return {"message": "Review deleted"}
