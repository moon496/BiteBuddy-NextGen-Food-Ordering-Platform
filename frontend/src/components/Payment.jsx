import { useState } from "react";
import { initiatePayment, confirmPayment } from "../api/paymentApi";

function Payment() {
  const [orderId, setOrderId] = useState("1001");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bkash");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const handleInitiate = async () => {
    setError("");
    setPayment(null);
    if (!amount) return;

    try {
      const data = await initiatePayment(orderId, parseFloat(amount), method);
      setPayment(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirm = async (forceResult) => {
    const updated = await confirmPayment(payment.payment_id, forceResult);
    setPayment(updated);
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
      <h2>Payment</h2>
      <p style={{ color: "#888", fontSize: 14 }}>
        Simulated bKash/card checkout (no real payment gateway connected yet).
      </p>

      <input
        type="text"
        placeholder="Order ID (e.g. 1001)"
        value={orderId}
        onChange={(e) => setOrderId(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8 }}
      />
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8 }}
      />
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8 }}
      >
        <option value="bkash">bKash</option>
        <option value="card">Card</option>
      </select>

      <button onClick={handleInitiate} style={{ padding: "10px 18px" }}>
        Start Payment
      </button>

      {error && <p style={{ color: "#c62828" }}>{error}</p>}

      {payment && (
        <div style={{ marginTop: 20, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
          <p>Payment ID: {payment.payment_id}</p>
          <p>Amount: ৳{payment.amount} via {payment.method}</p>
          <p>
            Status:{" "}
            <strong
              style={{
                color:
                  payment.status === "paid"
                    ? "#2e7d32"
                    : payment.status === "failed"
                    ? "#c62828"
                    : "#ff6b35",
              }}
            >
              {payment.status}
            </strong>
          </p>

          {payment.status === "pending" && (
            <div style={{ marginTop: 10 }}>
              <button onClick={() => handleConfirm("success")} style={{ marginRight: 8 }}>
                Simulate Success
              </button>
              <button onClick={() => handleConfirm("failure")}>Simulate Failure</button>
              <br />
              <button onClick={() => handleConfirm(null)} style={{ marginTop: 8 }}>
                Random Gateway Result
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Payment;
