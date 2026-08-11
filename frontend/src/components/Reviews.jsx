import { useEffect, useState } from "react";
import { getReviews, addReview } from "../api/reviewApi";

const MENU_ITEMS = [
  { id: 1, name: "Burger" },
  { id: 2, name: "Pizza" },
  { id: 3, name: "Pasta" },
  { id: 4, name: "Salad" },
  { id: 5, name: "MeatBox" },
  { id: 6, name: "Ice-cream" },
  { id: 7, name: "Sushi" },
  { id: 8, name: "Fried-Rice" },
];

function Reviews() {
  const [itemId, setItemId] = useState(1);
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const loadReviews = async (id) => {
    const result = await getReviews(id);
    setData(result);
  };

  useEffect(() => {
    loadReviews(itemId);
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addReview(itemId, rating, comment);
    setComment("");
    loadReviews(itemId);
  };

  return (
  <div className="bb-page">
    <div className="bb-header">
      <div className="bb-logo">
        <span className="bb-burger">☰</span>
        <span>BiteBuddy</span>
      </div>

      <span className="bb-header-icon">🍔</span>
    </div>

    <main className="bb-card bb-review-card">
      <div className="bb-page-heading">
        <span className="bb-eyebrow">CUSTOMER FEEDBACK</span>
        <h1>Ratings & Reviews</h1>
        <p>Share your experience and help others choose their food.</p>
      </div>

      <label className="bb-label">Choose a menu item</label>

      <select
        className="bb-input"
        value={itemId}
        onChange={(e) => setItemId(Number(e.target.value))}
      >
        {MENU_ITEMS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {data && (
        <div className="bb-rating-summary">
          <div className="bb-rating-star">★</div>

          <div>
            <strong>{data.average_rating} / 5</strong>
            <span>{data.count} reviews</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bb-review-form">
        <label className="bb-label">Your rating</label>

        <select
          className="bb-input"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <label className="bb-label">Your comment</label>

        <input
          className="bb-input"
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button type="submit" className="bb-primary-button">
          Submit Review
        </button>
      </form>

      <div className="bb-review-list">
        {data?.reviews.map((r) => (
          <div key={r.id} className="bb-review-item">
            <div className="bb-stars">
              {"★".repeat(r.rating)}
              {"☆".repeat(5 - r.rating)}
            </div>

            <p>{r.comment}</p>
          </div>
        ))}
      </div>
    </main>
  </div>
);
}
export default Reviews;