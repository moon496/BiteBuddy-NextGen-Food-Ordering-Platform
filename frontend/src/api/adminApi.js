const BASE_URL = "http://127.0.0.1:8000";

export const getAllOrders = async () => {
  const res = await fetch(`${BASE_URL}/admin/orders`);
  return res.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
};
