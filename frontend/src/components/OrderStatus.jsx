import { useState, useEffect } from "react";
import "./OrderStatus.css";

const API_BASE_URL = "http://localhost:8000";

const ORDER_STATUS_SEQUENCE = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
];

function OrderStatus() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [trackedOrderId, setTrackedOrderId] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState("");

  const fetchOrderStatus = async (orderId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`
      );

      if (!response.ok) {
        setStatusData(null);
        setError("Order not found.");
        return;
      }

      const data = await response.json();
      setStatusData(data);
      setError("");
    } catch (err) {
      setStatusData(null);
      setError("Unable to connect to the server.");
    }
  };

  const handleTrackOrder = () => {
    if (!orderIdInput.trim()) return;
    setTrackedOrderId(orderIdInput.trim());
  };

  useEffect(() => {
    if (!trackedOrderId) return;

    fetchOrderStatus(trackedOrderId);

    const interval = setInterval(() => {
      fetchOrderStatus(trackedOrderId);
    }, 5000);

    return () => clearInterval(interval);
  }, [trackedOrderId]);

  return (
    <div className="order-status-container">
      <h1>Track Your Order</h1>

      <div className="order-search">
        <input
          type="text"
          placeholder="Enter Order ID"
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
        />

        <button onClick={handleTrackOrder}>
          Track Order
        </button>
      </div>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {statusData && (
        <div className="status-card">
          <h2>Order #{statusData.order_id}</h2>

          <ul className="status-list">
            {ORDER_STATUS_SEQUENCE.map((step, index) => {
              let className = "";

              if (index < statusData.current_step) {
                className = "completed";
              } else if (index === statusData.current_step) {
                className = "active";
              }

              return (
                <li key={step} className={className}>
                  {step}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default OrderStatus;