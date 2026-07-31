const BASE_URL = "http://127.0.0.1:8000";
const USER_ID = 1;

export const getReviews = async (itemId) => {
  const res = await fetch(`${BASE_URL}/reviews/${itemId}`);
  return res.json();
};

export const addReview = async (itemId, rating, comment) => {
  const res = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_id: itemId, user_id: USER_ID, rating, comment }),
  });
  return res.json();
};
