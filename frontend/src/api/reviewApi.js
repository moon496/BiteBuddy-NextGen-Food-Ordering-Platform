import { getCurrentUserId } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL;

export const getReviews = async (itemId) => {
  const res = await fetch(`${BASE_URL}/reviews/${itemId}`);
  return res.json();
};

// Orders (with items) placed by the current user, flagged with whether each
// item has already been reviewed. Powers the "pick an order" review form.
export const getReviewableOrders = async () => {
  const res = await fetch(`${BASE_URL}/reviews/reviewable/${getCurrentUserId()}`);
  if (!res.ok) throw new Error("Failed to load your orders");
  const data = await res.json();
  return data.orders;
};

export const addReview = async (orderId, itemId, rating, comment) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      order_id: orderId,
      item_id: itemId,
      user_id: getCurrentUserId(),
      rating,
      comment,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to submit review");
  return data;
};

export const deleteReview = async (reviewId) => {
  const res = await fetch(
    `${BASE_URL}/reviews/${reviewId}?user_id=${getCurrentUserId()}`,
    { method: "DELETE" }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to delete review");
  return data;
};
