const BASE_URL = "http://127.0.0.1:8000";

export const applyCoupon = async (code, subtotal) => {
  const res = await fetch(`${BASE_URL}/coupons/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, subtotal }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Invalid coupon");
  }
  return res.json();
};
