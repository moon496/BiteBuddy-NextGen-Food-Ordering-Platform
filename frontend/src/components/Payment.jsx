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
  <div className="bb-page">
    <div className="bb-header">
      <div className="bb-logo">
        <span className="bb-burger">☰</span>
        <span>BiteBuddy</span>
      </div>

      <span className="bb-header-icon">🍔</span>
    </div>

    <main className="bb-card bb-payment-card">
      <div className="bb-page-heading">
        <span className="bb-eyebrow">CHECKOUT</span>
        <h1>Payment</h1>
        <p>
          Simulated bKash/card checkout, plus Cash on Delivery.
        </p>
      </div>

      <div className="bb-form-group">
        <label className="bb-label">Order ID</label>

        <input
          className="bb-input"
          type="text"
          placeholder="e.g. 1001"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
      </div>

      <div className="bb-form-group">
        <label className="bb-label">Amount</label>

        <input
          className="bb-input"
          type="number"
          placeholder="Enter amount"
          value={subtotal}
          onChange={(e) => {
            setSubtotal(e.target.value);
            setCouponResult(null);
          }}
        />
      </div>

      <div className="bb-coupon-row">
        <input
          className="bb-input"
          type="text"
          placeholder="Coupon code"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />

        <button
          onClick={handleApplyCoupon}
          className="bb-secondary-button"
        >
          Apply
        </button>
      </div>

      {couponError && (
        <div className="bb-message bb-error">
          {couponError}
        </div>
      )}

      {couponResult && (
        <div className="bb-payment-discount">
          <span>Coupon applied</span>

          <strong>
            -৳{couponResult.discount_amount}
          </strong>

          <small>
            New total: ৳{couponResult.total}
          </small>
        </div>
      )}

      <div className="bb-form-group">
        <label className="bb-label">Payment method</label>

        <select
          className="bb-input"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="bkash">bKash</option>
          <option value="card">Card</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      </div>

      <div className="bb-payable-box">
        <span>Payable amount</span>
        <strong>৳{finalAmount || 0}</strong>
      </div>

      <button
        onClick={handleInitiate}
        className="bb-primary-button bb-pay-button"
      >
        {method === "cod"
          ? "Place Order (Pay on Delivery)"
          : "Start Payment"}
      </button>

      {error && (
        <div className="bb-message bb-error">
          {error}
        </div>
      )}

      {payment && (
        <div className="bb-payment-result">
          <div className="bb-result-heading">
            <span className="bb-eyebrow">PAYMENT STATUS</span>
            <h3>Payment Details</h3>
          </div>

          <div className="bb-payment-detail">
            <span>Payment ID</span>
            <strong>{payment.payment_id}</strong>
          </div>

          <div className="bb-payment-detail">
            <span>Amount</span>
            <strong>
              ৳{payment.amount} via {payment.method}
            </strong>
          </div>

          <div className="bb-payment-detail">
            <span>Status</span>

            <strong
              className={`bb-status bb-status-${payment.status}`}
            >
              {payment.status}
            </strong>
          </div>

          {payment.status === "pending" &&
            method !== "cod" && (
              <div className="bb-payment-actions">
                <button
                  onClick={() => handleConfirm("success")}
                  className="bb-success-button"
                >
                  Simulate Success
                </button>

                <button
                  onClick={() => handleConfirm("failure")}
                  className="bb-danger-button"
                >
                  Simulate Failure
                </button>

                <button
                  onClick={() => handleConfirm(null)}
                  className="bb-outline-button"
                >
                  Random Gateway Result
                </button>
              </div>
            )}
        </div>
      )}
    </main>
  </div>
);
}

export default Payment;