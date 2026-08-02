const BASE_URL = import.meta.env.VITE_API_URL;

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
