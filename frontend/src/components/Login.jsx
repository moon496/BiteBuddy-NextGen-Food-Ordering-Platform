import { useState, useEffect } from "react";
import { registerUser, loginUser, logoutUser, fetchCurrentUser } from "../api/authApi";
import "./Login.css";

function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
        await registerUser(username, email, password);
        setMode("login");
        setError("Registration successful. Please log in.");
        return;
      }
      const data = await loginUser(email, password);
      localStorage.setItem("bitebuddy_token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
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

  if (loading) return <p>Loading...</p>;

  if (user) {
    return (
      <div className="auth-box">
        <p>
          Logged in as <strong>{user.username}</strong> ({user.email})
        </p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <h2>{mode === "login" ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      </form>
      {error && <p className="auth-error">{error}</p>}
      <button
        className="auth-toggle"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError("");
        }}
      >
        {mode === "login" ? "Need an account? Register" : "Already have an account? Login"}
      </button>
    </div>
  );
}

export default Login;