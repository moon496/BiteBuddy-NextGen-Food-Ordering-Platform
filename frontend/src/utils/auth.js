export const getToken = () => localStorage.getItem("bitebuddy_token");

export const getCurrentUserId = () => {
  const id = localStorage.getItem("bitebuddy_user_id");
  return id ? Number(id) : null;
};