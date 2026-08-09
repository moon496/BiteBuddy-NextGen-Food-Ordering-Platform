const BASE_URL = import.meta.env.VITE_API_URL;

export const getCart = async () => {
  const res = await fetch(`${BASE_URL}/cart/${USER_ID}`);
  const data = await res.json();
  return data.items; 
};

export const addToCart = async (itemId, quantity = 1) => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: USER_ID, item_id: itemId, quantity })
  });
  return res.json();
};

export const updateCartItem = async (cartId, quantity) => {
  const res = await fetch(`${BASE_URL}/cart/${USER_ID}/${cartId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity })
  });
  return res.json();
};

export const removeCartItem = async (cartId) => {
  const res = await fetch(`${BASE_URL}/cart/${USER_ID}/${cartId}`, {
    method: "DELETE"
  });
  return res.json();
};