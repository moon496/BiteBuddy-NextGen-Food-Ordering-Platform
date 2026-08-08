import { useEffect, useState, useRef } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  listAdmins,
  addAdmin,
  removeAdmin,
  getRevenue,
} from "../api/adminApi";

const DEMO_BASE_REVENUE = 15000; // demo starting amount — change korte paro

const ORDER_STATUS_SEQUENCE = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

const AUTO_UPDATE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

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
  const [statusSequence, setStatusSequence] = useState(ORDER_STATUS_SEQUENCE);
  const [loading, setLoading] = useState(true);

  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(true);

  // Keep a ref to always have the latest orders inside the interval callback
  const ordersRef = useRef([]);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data.orders);
    ordersRef.current = data.orders;
    setStatusSequence(data.status_sequence || ORDER_STATUS_SEQUENCE);
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

  const loadRevenue = async () => {
    setRevenueLoading(true);
    try {
      const data = await getRevenue();
      setRevenue(data);
    } catch (err) {
      console.error(err);
    }
    setRevenueLoading(false);
  };

  useEffect(() => {
    loadOrders();
    loadAdmins();
    loadRevenue();
  }, []);

  // Auto-advance every order's status every 5 minutes
  useEffect(() => {
    const timer = setInterval(async () => {
      const currentOrders = ordersRef.current;
      const seq = statusSequence.length ? statusSequence : ORDER_STATUS_SEQUENCE;

      const updatable = currentOrders.filter((o) => {
        const idx = seq.indexOf(o.status);
        return idx !== -1 && idx < seq.length - 1;
      });

      if (updatable.length === 0) return;

      await Promise.all(
        updatable.map((o) => {
          const nextStatus = seq[seq.indexOf(o.status) + 1];
          return updateOrderStatus(o.order_id, nextStatus);
        })
      );

      loadOrders();
      loadRevenue();
    }, AUTO_UPDATE_INTERVAL_MS);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusSequence]);

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

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    const d = new Date(isoString);
    return d.toLocaleString();
  };

  const formatItems = (items) => {
    if (!items || items.length === 0) return "-";
    return items.map((i) => `${i.item_name} x${i.quantity}`).join(", ");
  };

  if (loading) return <p>Loading orders...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
      <h2>Restaurant Order Dashboard</h2>
      <p style={{ color: "#888", fontSize: 13, marginTop: -8 }}>
        Order status auto-updates to the next stage every 5 minutes.
      </p>

      {/* --- Revenue Cards --- */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 30,
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <p style={labelStyle}>Total Revenue</p>
          <h3 style={valueStyle}>
            ৳
            {revenueLoading
              ? "..."
              : (DEMO_BASE_REVENUE + (revenue?.total_revenue || 0)).toLocaleString()}
          </h3>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Today's Revenue</p>
          <h3 style={valueStyle}>
            ৳{revenueLoading ? "..." : (revenue?.today_revenue || 0).toLocaleString()}
          </h3>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>This Month</p>
          <h3 style={valueStyle}>
            ৳
            {revenueLoading
              ? "..."
              : (DEMO_BASE_REVENUE + (revenue?.month_revenue || 0)).toLocaleString()}
          </h3>
        </div>
        <div style={cardStyle}>
          <p style={labelStyle}>Total Orders</p>
          <h3 style={valueStyle}>{revenueLoading ? "..." : revenue?.total_orders || 0}</h3>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
              <th style={{ padding: 8 }}>Order ID</th>
              <th style={{ padding: 8 }}>Username</th>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Items</th>
              <th style={{ padding: 8 }}>Total Amount</th>
              <th style={{ padding: 8 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.order_id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>#{o.order_id}</td>
                <td style={{ padding: 8 }}>{o.username || "-"}</td>
                <td style={{ padding: 8 }}>{formatDate(o.created_at)}</td>
                <td style={{ padding: 8 }}>{formatItems(o.items)}</td>
                <td style={{ padding: 8 }}>৳{o.total_amount}</td>
                <td style={{ padding: 8 }}>
                  <span style={statusBadgeStyle(o.status)}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

const cardStyle = {
  flex: "1 1 140px",
  background: "#fff",
  border: "1px solid #eee",
  borderRadius: 10,
  padding: "16px 20px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
};

const labelStyle = {
  margin: 0,
  fontSize: 13,
  color: "#888",
};

const valueStyle = {
  margin: "6px 0 0",
  fontSize: 22,
  color: "#222",
};

const statusColors = {
  Pending: "#f59e0b",
  Confirmed: "#3b82f6",
  Preparing: "#8b5cf6",
  "Out for Delivery": "#ec4899",
  Delivered: "#22c55e",
};

const statusBadgeStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  color: "#fff",
  backgroundColor: statusColors[status] || "#6b7280",
});

export default AdminDashboard;