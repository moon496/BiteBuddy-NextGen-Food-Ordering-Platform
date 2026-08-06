import { useEffect, useState } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  listAdmins,
  addAdmin,
  removeAdmin,
} from "../api/adminApi";

function AdminDashboard() {
  const role = localStorage.getItem("bitebuddy_role");

  if (role !== "Admin") {
    return (
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  const [orders, setOrders] = useState([]);
  const [statusSequence, setStatusSequence] = useState([]);
  const [loading, setLoading] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data.orders);
    setStatusSequence(data.status_sequence);
    setLoading(false);
  };

  const loadAdmins = async () => {
    setAdminsLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch (err) {
      console.error(err);
    }
    setAdminsLoading(false);
  };

  useEffect(() => {
    loadOrders();
    loadAdmins();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSubmitting(true);
    try {
      const res = await addAdmin(form.username, form.email, form.password);
      setFormSuccess(res.message || "Admin added successfully");
      setForm({ username: "", email: "", password: "" });
      loadAdmins();
    } catch (err) {
      setFormError(err.message);
    }
    setSubmitting(false);
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!window.confirm("Remove this admin's access?")) return;
    try {
      await removeAdmin(adminId);
      loadAdmins();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h2>Restaurant Order Dashboard</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
            <th style={{ padding: 8 }}>Order ID</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.order_id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>#{o.order_id}</td>
              <td style={{ padding: 8 }}>{o.status}</td>
              <td style={{ padding: 8 }}>
                <select
                  value={o.status}
                  onChange={(e) => handleStatusChange(o.order_id, e.target.value)}
                >
                  {statusSequence.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: "40px 0" }} />

      <h2>Admin Management</h2>

      <form
        onSubmit={handleAddAdmin}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 360,
          marginBottom: 24,
        }}
      >
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleFormChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleFormChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleFormChange}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Admin"}
        </button>
        {formError && <p style={{ color: "red" }}>{formError}</p>}
        {formSuccess && <p style={{ color: "green" }}>{formSuccess}</p>}
      </form>

      <h3>Current Admins</h3>
      {adminsLoading ? (
        <p>Loading admins...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Username</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{a.username}</td>
                <td style={{ padding: 8 }}>{a.email}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => handleRemoveAdmin(a.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;