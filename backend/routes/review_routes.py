from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# item_id -> list of review dicts
REVIEWS_DB: dict[int, list[dict]] = {}


class ReviewCreate(BaseModel):
    item_id: int
    user_id: int
    rating: int = Field(ge=1, le=5)
    comment: str = ""


@router.get("/{item_id}")
def get_reviews(item_id: int):
    reviews = REVIEWS_DB.get(item_id, [])
    average = round(sum(r["rating"] for r in reviews) / len(reviews), 1) if reviews else 0
    return {"item_id": item_id, "average_rating": average, "count": len(reviews), "reviews": reviews}


@router.post("", status_code=201)
def add_review(payload: ReviewCreate):
    item_reviews = REVIEWS_DB.setdefault(payload.item_id, [])
    new_id = (max([r["id"] for r in item_reviews], default=0)) + 1

    review = {
        "id": new_id,
        "user_id": payload.user_id,
        "rating": payload.rating,
        "comment": payload.comment,
    }
    item_reviews.append(review)
    return review


@router.delete("/{item_id}/{review_id}")
def delete_review(item_id: int, review_id: int):
    item_reviews = REVIEWS_DB.get(item_id, [])
    entry = next((r for r in item_reviews if r["id"] == review_id), None)
    if not entry:
        raise HTTPException(status_code=404, detail="Review not found")

    item_reviews.remove(entry)
    return {"message": "Review deleted"}
