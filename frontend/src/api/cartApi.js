const BASE_URL = "http://localhost:5000/api/cart";

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export const getCart = async () => {
  const res = await fetch(BASE_URL, { headers: authHeaders() });
  return res.json();
};

export const addToCart = async (itemId, quantity = 1) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ item_id: itemId, quantity })
  });
  return res.json();
};

export const updateCartItem = async (cartId, quantity) => {
  const res = await fetch(`${BASE_URL}/${cartId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ quantity })
  });
  return res.json();
};

export const removeCartItem = async (cartId) => {
  const res = await fetch(`${BASE_URL}/${cartId}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  return res.json();
};