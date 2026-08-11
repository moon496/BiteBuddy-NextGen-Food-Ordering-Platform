import { useEffect, useState, useRef } from "react";
import {
  getAllOrders,
  updateOrderStatus,
  listAdmins,
  addAdmin,
  removeAdmin,
  getRevenue,
  markOrderFailed,
  getBannedUsers,
  unbanUser,
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
    const adminName = 
      localStorage.getItem("bitebuddy_username") || "Admin";
    const adminEmail =
      localStorage.getItem("bitebuddy_email") || "admin1@bitebuddy.com";


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

  const [bannedUsers, setBannedUsers] = useState([]);
  const [bannedLoading, setBannedLoading] = useState(true);
  const [confirmOrderId, setConfirmOrderId] = useState(null);
  const [banAlert, setBanAlert] = useState(null);
  const [confirmAdminId, setConfirmAdminId] = useState(null);
  
  

  const loadBannedUsers = async () => {
    setBannedLoading(true);
    try {
      const data = await getBannedUsers();
      setBannedUsers(data);
    } catch (err) {
      console.error(err);
    }
    setBannedLoading(false);
  };

  const handleMarkFailed = (orderId) => {
    setConfirmOrderId(orderId);
  };

  const confirmMarkFailed = async () => {
    const orderId = confirmOrderId;
    setConfirmOrderId(null);
    try {
      const result = await markOrderFailed(orderId);
      if (result.is_banned) {
        setBanAlert({
          username: result.username || "This user",
          count: result.failed_delivery_count,
        });
      }
      loadOrders();
      loadBannedUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnban = async (userId) => {
    if (!window.confirm("Unban this user?")) return;
    try {
      await unbanUser(userId);
      loadBannedUsers();
    } catch (err) {
      alert(err.message);
    }
  };

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
    loadBannedUsers();
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
    setConfirmAdminId(adminId);
};

const confirmRemoveAdmin = async () => {
  const adminId = confirmAdminId;
  setConfirmAdminId(null);
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
  return d.toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });
};

  const formatItems = (items) => {
    if (!items || items.length === 0) return "-";
    return items.map((i) => `${i.item_name} x${i.quantity}`).join(", ");
  };
  

if (role !== "Admin") {
  return (
    <div className="access-denied-overlay">
      <div className="access-denied-card">
        <div className="access-denied-icon">🚫</div>
        <h2>Access Denied</h2>
        <p>
          You do not have permission to access this page.
          Admin privileges are required.
        </p>
      </div>
    </div>
  );
}

if (loading) return <p>Loading orders...</p>;
return (
    <div className="admin-dashboard-container">
      {confirmAdminId && (
  <div className="admin-popup-overlay">
    <div className="admin-popup-card admin-remove-popup">
      <div className="admin-popup-icon admin-remove-icon">⚠️</div>

      <h3>Remove Admin Access?</h3>

      <p>
        Are you sure you want to remove this administrator's
        access? They will no longer be able to access the
        Admin Dashboard.
      </p>

      <div className="admin-popup-actions">
        <button
          className="admin-popup-remove"
          onClick={confirmRemoveAdmin}
        >
          Yes, Remove
        </button>

        <button
          className="admin-popup-cancel"
          onClick={() => setConfirmAdminId(null)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      {confirmOrderId && (
        <div className="admin-popup-overlay">
          <div className="admin-popup-card">
            <div className="admin-popup-icon">⚠️</div>
            <h3>Mark as Failed?</h3>
            <p>This will flag order #{confirmOrderId} as a failed/fraudulent delivery. This action will be counted against the customer's account.</p>
            <div className="admin-popup-actions">
              <button className="admin-popup-confirm" onClick={confirmMarkFailed}>
                Yes, Mark Failed
              </button>
              <button className="admin-popup-cancel" onClick={() => setConfirmOrderId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {banAlert && (
        <div className="admin-popup-overlay">
          <div className="admin-popup-card admin-popup-danger">
            <div className="admin-popup-icon">⛔</div>
            <h3>User Banned</h3>
            <p>
              <strong>{banAlert.username}</strong> has reached {banAlert.count} failed
              deliveries and has been automatically banned from the platform.
            </p>
            <button className="admin-popup-confirm-danger" onClick={() => setBanAlert(null)}>
              Understood
            </button>
          </div>
        </div>
      )}
      <div className="admin-brand">
  <div className="admin-brand-logo">
    BiteBuddy <span>🍔</span>
  </div>
  <p>Fresh food. Fast delivery. Happy customers.</p>
</div>

<div className="admin-dashboard-header">
  <div className="admin-profile-info">
    <span className="admin-profile-label">ADMIN PANEL</span>
    <h1>{adminName}</h1>
    <p>{adminEmail}</p>
  </div>

  <div className="admin-profile-badge">
    <span>👤</span>
    <div>
      <strong>Administrator</strong>
      <small>Active Session</small>
    </div>
  </div>
</div>

      <div className="admin-dashboard-title">
        <div>
          <span className="admin-overview-label">OVERVIEW</span>
          <h2>Dashboard Overview</h2>
          <p>Manage BiteBuddy orders, revenue and users.</p>
        </div>
      </div>

      {/* --- Revenue Overview --- */}
<div className="admin-revenue-grid">

  <div className="admin-stat-card">
    <div className="admin-stat-icon">💲</div>
    <div>
      <p>Total Revenue</p>
      <h3>
        ৳
        {revenueLoading
          ? "..."
          : (
              DEMO_BASE_REVENUE +
              (revenue?.total_revenue || 0)
            ).toLocaleString()}
      </h3>
    </div>
  </div>

  <div className="admin-stat-card">
    <div className="admin-stat-icon">💰</div>
    <div>
      <p>Today's Revenue</p>
      <h3>
        ৳
        {revenueLoading
          ? "..."
          : (revenue?.today_revenue || 0).toLocaleString()}
      </h3>
    </div>
  </div>

  <div className="admin-stat-card">
    <div className="admin-stat-icon">📈</div>
    <div>
      <p>This Month</p>
      <h3>
        ৳
        {revenueLoading
          ? "..."
          : (
              DEMO_BASE_REVENUE +
              (revenue?.month_revenue || 0)
            ).toLocaleString()}
      </h3>
    </div>
  </div>

  <div className="admin-stat-card">
    <div className="admin-stat-icon">🛍️</div>
    <div>
      <p>Total Orders</p>
      <h3>
        {revenueLoading
          ? "..."
          : revenue?.total_orders || 0}
      </h3>
    </div>
  </div>

</div>


{/* --- Orders --- */}
<div className="admin-orders-section">
  <div className="admin-section-heading">
    <div>
      <span>ORDER MANAGEMENT</span>
      <h2>Recent Orders</h2>
      <p>Monitor and manage all BiteBuddy orders.</p>
    </div>
  </div>

  <div className="admin-orders-table-wrapper">
  <table className="admin-management-table">
    <thead>
      <tr
        style={{
          borderBottom: "2px solid #ddd",
          textAlign: "left",
        }}
      >
        <th>Order ID</th>
        <th>Username</th>
        <th>Date</th>
        <th>Items</th>
        <th>Total Amount</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {orders.map((o) => (
        <tr
          key={o.order_id}
          style={{ borderBottom: "1px solid #eee" }}
        >
          <td>
            #{o.order_id}
          </td>

          <td>
            {o.username || "-"}
          </td>

          <td>
            {formatDate(o.created_at)}
          </td>

          <td>
            {formatItems(o.items)}
          </td>

          <td>
            ৳{o.total_amount}
          </td>

          <td>
            <span style={statusBadgeStyle(o.status)}>
              {o.status}
            </span>
          </td>

          <td>
            {o.status !== "Failed" &&
              o.status !== "Delivered" && (
                <button
                  onClick={() =>
                    handleMarkFailed(o.order_id)
                  }
                  style={{
                    background: "#c62828",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                  }}
                >
                  Mark Failed
                </button>
              )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>


<hr style={{ margin: "40px 0" }} />


{/* --- Admin Management --- */}
<div className="admin-section-heading">
  <div>
    <span>TEAM ACCESS</span>
    <h2>Admin Management</h2>
    <p>Add, manage and remove BiteBuddy administrators.</p>
  </div>
</div>

<form
  onSubmit={handleAddAdmin}
  className="admin-management-form"
>
  <div className="admin-form-title">
    <span className="admin-form-icon">➕</span>
    <div>
      <h3>Add New Admin</h3>
      <p>Create an administrator account</p>
    </div>
  </div>

  <div className="admin-form-fields">

    <div className="admin-input-group">
      <label>Username</label>
      <input
        name="username"
        placeholder="Enter username"
        value={form.username}
        onChange={handleFormChange}
        required
      />
    </div>

    <div className="admin-input-group">
      <label>Email Address</label>
      <input
        name="email"
        type="email"
        placeholder="admin@example.com"
        value={form.email}
        onChange={handleFormChange}
        required
      />
    </div>

    <div className="admin-input-group">
      <label>Password</label>
      <input
        name="password"
        type="password"
        placeholder="Create a password"
        value={form.password}
        onChange={handleFormChange}
        required
      />
    </div>

  </div>

  <button
    type="submit"
    className="admin-add-button"
    disabled={submitting}
  >
    {submitting ? "Adding Admin..." : "Add Admin"}
  </button>

  {formError && (
    <p className="admin-form-error">
      {formError}
    </p>
  )}

  {formSuccess && (
    <p className="admin-form-success">
      {formSuccess}
    </p>
  )}
</form>


<div className="current-admins-header">
  <div>
    <span>AUTHORIZED USERS</span>
    <h3>Current Admins</h3>
  </div>

  <div className="admin-count">
    {admins.length} Admin{admins.length !== 1 ? "s" : ""}
  </div>
</div>
{adminsLoading ? (
  <p>Loading admins...</p>
) : (
  <div className="current-admins-table-wrapper">
    <table className="current-admins-table">
      <thead>
        <tr>
          <th>Username</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {admins.map((a) => (
          <tr key={a.id}>
            <td>
              <div className="admin-user-cell">
                <div className="admin-user-icon">A</div>
                <strong>{a.username}</strong>
              </div>
            </td>

            <td>{a.email}</td>

            <td>
              {a.username !== "admin1" && (
              <button
                className="admin-remove-button"
                onClick={() => handleRemoveAdmin(a.id)}
              >
                Remove
              </button>
            )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


<hr style={{ margin: "40px 0" }} />


{/* --- Banned Users --- */}
<h2>Banned Users (Fraud Detection)</h2>

<p
  style={{
    color: "#888",
    fontSize: 13,
    marginTop: -8,
  }}
>
  Users are automatically banned after 3
  failed/fraudulent deliveries.
</p>

{bannedLoading ? (
  <p>Loading...</p>
) : bannedUsers.length === 0 ? (
  <p style={{ color: "#888" }}>
    No banned users.
  </p>
) : (
  <table
    className="admin-banned-table"
  >
    <thead>
      <tr
        style={{
          borderBottom: "2px solid #ddd",
          textAlign: "left",
        }}
      >
        <th style={{ padding: 8 }}>Username</th>
        <th style={{ padding: 8 }}>Email</th>
        <th style={{ padding: 8 }}>
          Failed Deliveries
        </th>
        <th style={{ padding: 8 }}></th>
      </tr>
    </thead>

    <tbody>
      {bannedUsers.map((u) => (
        <tr
          key={u.id}
          style={{
            borderBottom: "1px solid #eee",
          }}
        >
          <td style={{ padding: 8 }}>
            {u.username}
          </td>

          <td style={{ padding: 8 }}>
            {u.email}
          </td>

          <td style={{ padding: 8 }}>
            {u.failed_delivery_count}
          </td>

          <td style={{ padding: 8 }}>
            <button
              onClick={() =>
                handleUnban(u.id)
              }
            >
              Unban
            </button>
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
  Failed: "#c62828",
};


const statusBadgeStyle = (status) => ({
  padding: "4px 10px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  color: "#fff",
  backgroundColor:
    statusColors[status] || "#6b7280",
});


export default AdminDashboard;