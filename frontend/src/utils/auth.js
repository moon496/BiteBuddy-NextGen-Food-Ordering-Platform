export const getToken = () => localStorage.getItem("bitebuddy_token");

// Logged-in hole real user id, na hole ekta persistent guest id
export const getCurrentUserId = () => {
  const realId = localStorage.getItem("bitebuddy_user_id");
  if (realId) return Number(realId);

  let guestId = localStorage.getItem("bitebuddy_guest_id");
  if (!guestId) {
    guestId = Math.floor(100000 + Math.random() * 900000);
    localStorage.setItem("bitebuddy_guest_id", guestId);
  }
  return Number(guestId);
};
