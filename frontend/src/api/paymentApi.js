const BASE_URL = import.meta.env.VITE_API_URL;

export const initiatePayment = async (orderId, amount, method) => {
  const res = await fetch(`${BASE_URL}/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId, amount, method }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Could not start payment");
  }
  return res.json();
};

export const confirmPayment = async (paymentId, forceResult = null) => {
  const res = await fetch(`${BASE_URL}/payments/${paymentId}/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force_result: forceResult }),
  });
  return res.json();
};
