const BASE_URL = import.meta.env.VITE_API_URL;
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
