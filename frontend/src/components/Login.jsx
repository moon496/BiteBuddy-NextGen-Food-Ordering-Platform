import { useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, fetchCurrentUser, updateUser, deleteUser } from "../api/authApi";
import "./Login.css";

function Login({ setView }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("bitebuddy_token");
    if (savedToken) {
      fetchCurrentUser(savedToken)
        .then((data) => {
          setToken(savedToken);
          setUser(data);
        })
        .catch(() => localStorage.removeItem("bitebuddy_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        await registerUser(username, email, password, role);
        setMode("login");
        setError("Registration successful. Please log in.");
        return;
      }
      const data = await loginUser(email, password);
      localStorage.setItem("bitebuddy_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);

      const redirectTarget = localStorage.getItem("checkout_redirect");
      if (redirectTarget && setView) {
        localStorage.removeItem("checkout_redirect");
        setView(redirectTarget);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(token);
    } finally {
      localStorage.removeItem("bitebuddy_token");
      setToken(null);
      setUser(null);
    }
  };

  const handleEditStart = () => {
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditMode(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUser(token, editUsername, editEmail);
      setUser(updated);
      setEditMode(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }
    try {
      await deleteUser(token);
      localStorage.removeItem("bitebuddy_token");
      setToken(null);
      setUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="auth-loading">Loading BiteBuddy…</div>;

  // ---- Shared brand panel (left side) ----
  const BrandPanel = () => (
    <div className="auth-brand-panel">
      <div className="brand-pattern" aria-hidden="true"></div>
      <div className="brand-content">
        <div className="brand-mark">🍔</div>
        <h1>BiteBuddy</h1>
        <p>Delicious food, delivered fast.</p>

        <div className="ticket-stack" aria-hidden="true">
          <div className="ticket ticket-1">
            <span className="ticket-dot"></span>
            Double cheeseburger <em>· 12 min</em>
          </div>
          <div className="ticket ticket-2">
            <span className="ticket-dot"></span>
            Mango lassi <em>· 8 min</em>
          </div>
          <div className="ticket ticket-3">
            <span className="ticket-dot"></span>
            Spicy ramen bowl <em>· 15 min</em>
          </div>
        </div>

        <div className="delivery-badge">
          <span className="pulse-dot"></span>
          Average delivery: 24 min
        </div>
      </div>
    </div>
  );

  // ---- Logged-in view ----
  if (user) {
    const initial = user.username.charAt(0).toUpperCase();
    return (
      <div className="auth-page">
        <BrandPanel />
        <div className="auth-form-panel">
          <div className="auth-card profile-card">
            <div className="avatar-circle">{initial}</div>
            <h2>{user.username}</h2>
            <p className="user-email">{user.email}</p>
            <span className={`role-badge ${user.role === "Admin" ? "role-admin" : "role-user"}`}>
              {user.role === "Admin" ? "Logged in as Admin" : "Logged in as User"}
            </span>

            {!editMode ? (
              <div className="profile-actions">
                <button onClick={handleEditStart}>Edit profile</button>
                <button onClick={handleLogout}>Log out</button>
                <button className="danger-btn" onClick={handleDelete}>
                  Delete account
                </button>
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <input
                  type="text"
                  placeholder="Username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
                <div className="edit-form-buttons">
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {error && <p className="auth-error">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ---- Login / Register view ----
  return (
    <div className="auth-page">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Log in
            </button>
            <button
              type="button"
              className={mode === "register" ? "auth-tab active" : "auth-tab"}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="field">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="hungry_hippo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === "register" && (
              <div className="field">
                <label>I'm ordering as</label>
                <div className="role-select">
                  <button
                    type="button"
                    className={role === "User" ? "role-option active" : "role-option"}
                    onClick={() => setRole("User")}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    className={role === "Admin" ? "role-option active" : "role-option"}
                    onClick={() => setRole("Admin")}
                  >
                    Admin
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn">
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {error && <p className="auth-error">{error}</p>}

          <p className="auth-switch">
            {mode === "login" ? "Don't have an account yet? " : "Already have an account? "}
            <span
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Register for free" : "Log in"}
            </span>
          </p>
        </div>

        <p className="auth-footer">
          Built by{" "}
          <a href="https://github.com/farhana2443" target="_blank" rel="noopener noreferrer">
            Farhana
          </a>
          ,{" "}
          <a href="https://github.com/moon496" target="_blank" rel="noopener noreferrer">
            Moon
          </a>{" "}
          &{" "}
          <a href="https://github.com/Yeonali" target="_blank" rel="noopener noreferrer">
            Naim
          </a>{" "}
          ·{" "}
          <a
            href="https://github.com/moon496/BiteBuddy-NextGen-Food-Ordering-Platform"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
