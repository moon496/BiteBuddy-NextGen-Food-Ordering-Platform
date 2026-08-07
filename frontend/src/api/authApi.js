const BASE_URL = import.meta.env.VITE_API_URL;
console.log("BASE_URL =", BASE_URL);
export const registerUser = async (username, email, password, role = "User") => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role }),
  });
  if (!res.ok) {
    const err = await res.json();
    let message = "Registration failed";
    if (Array.isArray(err.detail)) {
      message = err.detail.map((e) => e.msg).join(", ");
    } else if (typeof err.detail === "string") {
      message = err.detail;
    }

    throw new Error(message);
  }
  return res.json();
};

export const loginUser = async (email, password) => {
  console.log("Login attempt:", email, password); // temporary debug line — pore remove korte hobe
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
  return res.json();
};

export const logoutUser = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const fetchCurrentUser = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
};

export const updateUser = async (token, username, email) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Update failed");
  }
  return res.json();
};

export const deleteUser = async (token) => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Delete failed");
  }
  return res.json();
};