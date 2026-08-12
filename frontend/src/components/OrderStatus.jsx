import { useState, useEffect } from "react";
import "./OrderStatus.css";

const BASE_URL = import.meta.env.VITE_API_URL;


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
  const [showPayPopup, setShowPayPopup] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const fetchOrderStatus = async (orderId) => {
    try {
    
      const response = await fetch(
        `${BASE_URL}/orders/${orderId}/status`
      );

      if (!response.ok) {
        setStatusData(null);
        if (response.status === 403) {
          setError(
            "Order Tracking Unavailable: The account associated with this order has been banned due to repeated failed or cancelled orders. If you think this is a mistake, please contact the admin at admin1@bitebuddy.com."
          );
        } else if (response.status === 404) {
            setError("Order not found.");
        } else {
            setError("Unable to retrieve order status.");
        }
        return;
      }

      const data = await response.json();
      setStatusData(data);
      setError("");

      if (
        data.status === "Delivered" &&
        data.payment_method === "cod" &&
        data.payment_status === "pending"
      ) {
        setShowPayPopup(true);
      }
    } catch (err) {
      setStatusData(null);
      setError("Unable to connect to the server.");
    }
  };
  const handleConfirmPaid = async () => {
  if (!statusData) return;
  setConfirmingPayment(true);
  try {
    const res = await fetch(`${BASE_URL}/orders/${statusData.order_id}/confirm-payment`, {
      method: "PATCH",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to confirm payment");
    setShowPayPopup(false);
    // status ta locally o update kore dicchi, fetch abar hobe next poll-e
    setStatusData((prev) => prev ? { ...prev, payment_status: "paid" } : prev);
  } catch (err) {
    setError(err.message);
  } finally {
    setConfirmingPayment(false);
  }
};{showPayPopup && (
  <div className="order-pay-popup-overlay">
    <div className="order-pay-popup-card">
      <div className="order-pay-popup-icon">💵</div>
      <h3>Your order has been delivered!</h3>
      <p>Please pay ৳{statusData.total_amount || ""} to the delivery rider now.</p>
      <button
        className="order-pay-popup-ok"
        onClick={handleConfirmPaid}
        disabled={confirmingPayment}
      >
        {confirmingPayment ? "Confirming..." : "I've Paid"}
      </button>
      <button
        className="order-pay-popup-later"
        onClick={() => setShowPayPopup(false)}
      >
        Remind me later
      </button>
    </div>
  </div>
)}

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

      {showPayPopup && (
        <div className="order-pay-popup-overlay">
          <div className="order-pay-popup-card">
            <div className="order-pay-popup-icon">💵</div>
            <h3>Your order has been delivered!</h3>
            <p>Please pay ৳{statusData.total_amount || ""} to the delivery rider now.</p>
            <button
              className="order-pay-popup-ok"
              onClick={() => setShowPayPopup(false)}
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderStatus;