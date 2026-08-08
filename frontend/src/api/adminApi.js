const BASE_URL = import.meta.env.VITE_API_URL;
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("bitebuddy_token")}`,
});

export const getAllOrders = async () => {
  const res = await fetch(`${BASE_URL}/admin/orders`, { headers: authHeader() });
  return res.json();
};

export const updateOrderStatus = async (orderId, status) => {
  const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const listAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admin/admins`, { headers: authHeader() });
  return res.json();
};

export const addAdmin = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/admin/admins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to add admin");
  }
  return res.json();
};

export const removeAdmin = async (adminId) => {
  const res = await fetch(`${BASE_URL}/admin/admins/${adminId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to remove admin");
  }
  return res.json();
};

export const assignCoupon = async (userId, code, discountType, value, maxDiscount = null) => {
  const res = await fetch(`${BASE_URL}/admin/coupons`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({
      user_id: userId,
      code,
      discount_type: discountType,
      value,
      max_discount: maxDiscount,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to assign coupon");
  }
  return res.json();
};

export const listAssignedCoupons = async () => {
  const res = await fetch(`${BASE_URL}/admin/coupons`, { headers: authHeader() });
  return res.json();
};

export const removeAssignedCoupon = async (couponId) => {
  const res = await fetch(`${BASE_URL}/admin/coupons/${couponId}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to remove coupon");
  }
  return res.json();
};


export async function getRevenue() {
  const res = await fetch(`${BASE_URL}/admin/revenue`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("bitebuddy_token")}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load revenue");
  return res.json();
}