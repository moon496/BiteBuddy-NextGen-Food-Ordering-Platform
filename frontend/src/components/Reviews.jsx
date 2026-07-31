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
    <div style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>Ratings & Reviews</h2>

      <select
        value={itemId}
        onChange={(e) => setItemId(Number(e.target.value))}
        style={{ width: "100%", padding: 10, marginBottom: 16 }}
      >
        {MENU_ITEMS.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {data && (
        <p>
          Average rating: <strong>{data.average_rating} / 5</strong> ({data.count} reviews)
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ margin: "16px 0" }}>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ marginRight: 8 }}
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r > 1 ? "s" : ""}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ width: "60%", padding: 8, marginRight: 8 }}
        />
        <button type="submit">Submit</button>
      </form>

      {data?.reviews.map((r) => (
        <div
          key={r.id}
          style={{ borderBottom: "1px solid #eee", padding: "8px 0" }}
        >
          <strong>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</strong>
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default Reviews;
