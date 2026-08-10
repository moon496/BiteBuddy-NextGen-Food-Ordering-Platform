const BASE_URL = import.meta.env.VITE_API_URL;

export const applyCoupon = async (code, subtotal) => {
  const token = localStorage.getItem("bitebuddy_token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/coupons/apply`, {
    method: "POST",
    headers,
    body: JSON.stringify({ code, subtotal }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Invalid coupon");
  return data;
};

export const redeemCoupon = async (userCouponId) => {
  const token = localStorage.getItem("bitebuddy_token");
  const res = await fetch(`${BASE_URL}/coupons/redeem/${userCouponId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const myCoupons = async () => {
  const token = localStorage.getItem("bitebuddy_token");
  if (!token) return [];

  const res = await fetch(`${BASE_URL}/coupons/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
};