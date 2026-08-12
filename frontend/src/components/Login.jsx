import { useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, fetchCurrentUser, updateUser, deleteUser } from "../api/authApi";
import NotificationModal from "./NotificationModal";
import { getBestCoupon } from "../api/couponApi";
import { getWelcomeCoupon } from "../api/couponApi";
import "./Login.css";

function Login({ setView, token, setToken, onWelcomeCoupon }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [banPopup, setBanPopup] = useState("");
  const [deletePopup, setDeletePopup] = useState(false);
  const [deleteSuccessPopup, setDeleteSuccessPopup] = useState(false);
  const [welcomeCoupon, setWelcomeCoupon] = useState(null);
  
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
          localStorage.setItem("bitebuddy_user_id", data.id);
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
        // role r pathanor dorkar nai, backend nijei "User" set kore dey
        await registerUser(username, email, password);
        setMode("login");
        setError("Registration successful. Please log in.");
        return;
      }
      const data = await loginUser(email, password);
      localStorage.setItem("bitebuddy_token", data.access_token);
      localStorage.setItem("bitebuddy_user_id", data.user.id);
      
      localStorage.setItem("bitebuddy_role", data.user.role);
      localStorage.setItem("bitebuddy_username", data.user.username);
      localStorage.setItem("bitebuddy_email", data.user.email); 
      setToken(data.access_token);
      setUser(data.user);
      try {
  const welcomeData = await getWelcomeCoupon();

  if (welcomeData?.available && welcomeData?.coupon) {
    onWelcomeCoupon?.(welcomeData.coupon);
  }
}
catch (couponErr) {
  console.log("Welcome coupon check failed:", couponErr);
}
      try {
  const couponData = await getBestCoupon(1000);

  if (
    couponData?.best_coupon?.code === "WELCOME30"
  ) {
    onWelcomeCoupon?.(couponData.best_coupon);
  }
} catch (couponErr) {
  console.log("Welcome coupon check failed:", couponErr);
}
      


      if (setView) {
        if (data.user.role === "Admin") {
          console.log("LOGIN ROLE:", data.user.role);
          console.log("GOING TO ADMIN DASHBOARD");
          localStorage.removeItem("checkout_redirect");
          setView("admin");
        } else {
          const redirectTarget = localStorage.getItem("checkout_redirect");

          if (redirectTarget) {
            localStorage.removeItem("checkout_redirect");
            setView(redirectTarget);
          } else {
            setView("menu");
          }
        }
      }
    } catch (err) {
      const message = err.message || "Login failed";
      if (message.toLowerCase().includes("banned")) {
        setError("Your account has been banned due to repeated failed or cancelled orders. If you think this is a mistake, please contact the admin at admin1@bitebuddy.com.");
      } else {
        setError(message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(token);
    } finally {
      localStorage.removeItem("bitebuddy_token");
      localStorage.removeItem("bitebuddy_role");
      localStorage.removeItem("bitebuddy_user_id");
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
    setDeletePopup(true);
  };

  if (loading) return <div className="auth-loading">Loading BiteBuddy…</div>;
  

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
  if (deleteSuccessPopup) {
  return (
    <div className="delete-popup-overlay">
      <div className="delete-popup-card success-delete-card">
        <div className="delete-success-icon">✓</div>

        <h3>Account deleted successfully</h3>

        <p>Your account has been successfully deleted.</p>

        <button
          className="delete-success-btn"
          onClick={() => {
  setDeleteSuccessPopup(false);

  setMode("login");
  setUsername("");
  setEmail("");
  setPassword("");
  setError("");

  setEditMode(false);
  setEditUsername("");
  setEditEmail("");

  setView?.("account");
}}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

  if (user) {
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className="auth-page">

      {/* Account Banned Popup */}
      {banPopup && (
        <div className="ban-popup-overlay">
          <div className="ban-popup-card">
            <div className="ban-popup-icon">⛔</div>

            <h3>Account Banned</h3>

            <p>{banPopup}</p>

            <button
              className="ban-popup-close"
              onClick={() => setBanPopup("")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deletePopup && (
        <div className="delete-popup-overlay">
          <div className="delete-popup-card">

            <div className="delete-popup-icon">⚠️</div>

            <h3>Are you sure?</h3>

            <p>
              Are you sure you want to delete your account?
              <br />
              This action cannot be undone.
            </p>

            <div className="delete-popup-actions">

              <button
                className="delete-cancel-btn"
                onClick={() => setDeletePopup(false)}
              >
                Cancel
              </button>

              <button
                className="delete-confirm-btn"
                onClick={async () => {
                  setDeletePopup(false);

                  try {
                    await deleteUser(token);

                    localStorage.removeItem("bitebuddy_token");
                    localStorage.removeItem("bitebuddy_role");
                    localStorage.removeItem("bitebuddy_user_id");
                    localStorage.removeItem("bitebuddy_username");
                    localStorage.removeItem("bitebuddy_email");

                    setToken(null);
                    setUser(null);

                    setDeleteSuccessPopup(true);
                  } catch (err) {
                    setError(err.message);
                  }
                }}
              >
                Yes, delete
              </button>

            </div>
          </div>
        </div>
      )}
      
      <BrandPanel />

      <div className="auth-form-panel">
        <div className="auth-card profile-card">

          <div className="avatar-circle">
            {initial}
          </div>

          <h2>{user.username}</h2>

          <p className="user-email">
            {user.email}
          </p>

          <span
            className={`role-badge ${
              user.role === "Admin"
                ? "role-admin"
                : "role-user"
            }`}
          >
            {user.role === "Admin"
              ? "Logged in as Admin"
              : "Logged in as User"}
          </span>

          {!editMode ? (
            <div className="profile-actions">

              <button onClick={handleEditStart}>
                Edit profile
              </button>

              <button onClick={handleLogout}>
                Log out
              </button>

              <button
                className="danger-btn"
                onClick={handleDelete}
              >
                Delete account
              </button>

            </div>
          ) : (
            <form
              onSubmit={handleEditSubmit}
              className="edit-form"
            >
              <input
                type="text"
                placeholder="Username"
                value={editUsername}
                onChange={(e) =>
                  setEditUsername(e.target.value)
                }
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={editEmail}
                onChange={(e) =>
                  setEditEmail(e.target.value)
                }
                required
              />

              <div className="edit-form-buttons">

                <button type="submit">
                  Save
                </button>

                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>

              </div>
            </form>
          )}

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}

        </div>
      </div>

    </div>
  );
}

return (
  <div className="auth-page">

    <BrandPanel />

    <div className="auth-form-panel">

      <div className="auth-card">

        <div className="auth-tabs">

          <button
            type="button"
            className={
              mode === "login"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Log in
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "auth-tab active"
                : "auth-tab"
            }
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
                onChange={(e) =>
                  setUsername(e.target.value)
                }
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
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          <div className="field">

            <label>Password</label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {/* Admin role select purapuri sorano hoyeche.
              Notun account shob shomoy "User" hisebe register hobe.
              Admin banano jabe shudhu seed script diye, othoba
              existing admin er "Manage Admins" panel theke. */}

          <button
            type="submit"
            className="submit-btn"
          >
            {mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>

        </form>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <p className="auth-switch">

          {mode === "login"
            ? "Don't have an account yet? "
            : "Already have an account? "}

          <span
            onClick={() => {
              setMode(
                mode === "login"
                  ? "register"
                  : "login"
              );
              setError("");
            }}
          >
            {mode === "login"
              ? "Register for free"
              : "Log in"}
          </span>

        </p>

      </div>

      <p className="auth-footer">

        Built by{" "}

        <a
          href="https://github.com/farhana2443"
          target="_blank"
          rel="noopener noreferrer"
        >
          Farhana
        </a>

        ,{" "}

        <a
          href="https://github.com/moon496"
          target="_blank"
          rel="noopener noreferrer"
        >
          Moon
        </a>

        {" "}&{" "}

        <a
          href="https://github.com/Yeonali"
          target="_blank"
          rel="noopener noreferrer"
        >
          Naim
        </a>

        {" "}·{" "}

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