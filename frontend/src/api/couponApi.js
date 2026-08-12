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
export const getBestCoupon = async (subtotal) => {
  const token = localStorage.getItem("bitebuddy_token");

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/coupons/best`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      code: "",
      subtotal,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Could not find best coupon");
  }

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

export const myCoupons = async (token) => {
  if (!token) return [];

  const res = await fetch(`${BASE_URL}/coupons/my`, {
    headers: { Authorization: `Bearer ${token}`, },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "Failed to load coupons");

  }
  return res.json();
};

export const getWelcomeCoupon = async () => {
  const token = localStorage.getItem("bitebuddy_token");

  if (!token) return null;

  const res = await fetch(`${BASE_URL}/coupons/welcome`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Could not check welcome coupon");
  }

  return data;
};