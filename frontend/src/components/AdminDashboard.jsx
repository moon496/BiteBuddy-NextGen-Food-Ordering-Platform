import { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../api/adminApi";

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [statusSequence, setStatusSequence] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data.orders);
    setStatusSequence(data.status_sequence);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    loadOrders();
  };

  if (loading) return <p>Loading orders...</p>;

  return (
   <div className="styled-page" style={{ maxWidth: 750, margin: "40px auto", padding: 20 }}>
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
    </div>
  );
}

export default AdminDashboard;
