import { useState } from "react";
import { initiatePayment, confirmPayment } from "../api/paymentApi";
import { applyCoupon, redeemCoupon } from "../api/couponApi";

function Payment() {
  const [orderId, setOrderId] = useState("1001");
  const [subtotal, setSubtotal] = useState("");
  const [method, setMethod] = useState("bkash");

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const finalAmount = couponResult ? couponResult.total : parseFloat(subtotal) || 0;

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponResult(null);
    if (!subtotal) {
      setCouponError("Enter the amount first");
      return;
    }
    try {
      const data = await applyCoupon(couponCode, parseFloat(subtotal));
      setCouponResult(data);
    } catch (err) {
      setCouponError(err.message);
    }
  };

  const handleInitiate = async () => {
    setError("");
    setPayment(null);
    if (!subtotal) return;

    try {
      if (method === "cod") {
        // No online gateway needed — confirm the order immediately.
        const data = await initiatePayment(orderId, finalAmount, "cod");
        const confirmed = await confirmPayment(data.payment_id, "success");
        setPayment(confirmed);
        if (couponResult?.user_coupon_id) {
          await redeemCoupon(couponResult.user_coupon_id);
        }
        return;
      }

      const data = await initiatePayment(orderId, finalAmount, method);
      setPayment(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirm = async (forceResult) => {
    const updated = await confirmPayment(payment.payment_id, forceResult);
    setPayment(updated);
    if (updated.status === "paid" && couponResult?.user_coupon_id) {
      await redeemCoupon(couponResult.user_coupon_id);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
      <h2>Payment</h2>
      <p style={{ color: "#888", fontSize: 14 }}>
        Simulated bKash/card checkout, plus Cash on Delivery.
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
        value={subtotal}
        onChange={(e) => {
          setSubtotal(e.target.value);
          setCouponResult(null);
        }}
        style={{ width: "100%", padding: 10, marginBottom: 8 }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          style={{ flex: 1, padding: 10 }}
        />
        <button onClick={handleApplyCoupon} style={{ padding: "10px 14px" }}>
          Apply
        </button>
      </div>
      {couponError && <p style={{ color: "#c62828", fontSize: 13 }}>{couponError}</p>}
      {couponResult && (
        <div style={{ fontSize: 14, marginBottom: 8, color: "#2e7d32" }}>
          Coupon applied: -৳{couponResult.discount_amount} &nbsp;
          <strong>New total: ৳{couponResult.total}</strong>
        </div>
      )}

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 8 }}
      >
        <option value="bkash">bKash</option>
        <option value="card">Card</option>
        <option value="cod">Cash on Delivery</option>
      </select>

      <p style={{ fontWeight: "bold" }}>Payable: ৳{finalAmount || 0}</p>

      <button onClick={handleInitiate} style={{ padding: "10px 18px" }}>
        {method === "cod" ? "Place Order (Pay on Delivery)" : "Start Payment"}
      </button>

      {error && <p style={{ color: "#c62828" }}>{error}</p>}

      {payment && (
        <div style={{ maxWidth: 420, margin: "40px auto", padding: 20 }}>
          <p>Payment ID: {payment.payment_id}</p>
          <p>
            Amount: ৳{payment.amount} via {payment.method}
          </p>
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

          {payment.status === "pending" && method !== "cod" && (
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