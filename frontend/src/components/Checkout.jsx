import { useEffect, useState } from "react";
import { getAddresses, addAddress } from "../api/addressApi";
import { applyCoupon, redeemCoupon } from "../api/couponApi";
import { initiatePayment, confirmPayment } from "../api/paymentApi";
import { getCurrentUserId } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL;

function Checkout({ setView, token }) {
  const [step, setStep] = useState("address"); // address -> payment -> confirm
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [orderId, setOrderId] = useState(null);
  const [subtotal, setSubtotal] = useState(Number(localStorage.getItem("checkout_cart_total")) || 0);

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  const [method, setMethod] = useState("cod");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const finalAmount = couponResult ? couponResult.total : subtotal;

  useEffect(() => {
    if (!token) return;
    getAddresses(token).then(setAddresses).catch((err) => setError(err.message));
  }, [token]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!label.trim() || !addressLine.trim() || !city.trim() || !phone.trim()) return;
    try {
      const newAddr = await addAddress(token, label, addressLine, city, phone);
      setLabel(""); setAddressLine(""); setCity(""); setPhone("");
      const updated = await getAddresses(token);
      setAddresses(updated);
      setSelectedAddressId(newAddr.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleContinueToPayment = async () => {
    if (!selectedAddressId) {
      setError("Please select or add an address first.");
      return;
    }
    try {
      const res = await fetch(
        `${BASE_URL}/orders/create?user_id=${getCurrentUserId()}&address_id=${selectedAddressId}&payment_method=${method}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create order");
      setOrderId(data.order_id);
      setSubtotal(data.total);
      setStep("payment");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponResult(null);
    try {
      const data = await applyCoupon(couponCode, subtotal);
      setCouponResult(data);
    } catch (err) {
      setCouponError(err.message);
    }
  };

  const handlePay = async () => {
    setError("");
    try {
      const data = await initiatePayment(orderId, finalAmount, method);
      const confirmed = await confirmPayment(data.payment_id, method === "cod" ? "success" : "success");
      setPayment(confirmed);
      if (couponResult?.user_coupon_id) {
        await redeemCoupon(couponResult.user_coupon_id);
      }
      setStep("confirm");
    } catch (err) {
      setError(err.message);
    }
  };

  const methodLabel =
    method === "cod" ? "Cash on Delivery" : method === "bkash" ? "bKash" : "Card";

  if (step === "address") {
    return (
      <div className="address-page">
        <h2>Select Delivery Address</h2>
        {addresses.map((a) => (
          <div
            key={a.id}
            className="address-item"
            style={{ border: selectedAddressId === a.id ? "2px solid #ff6b35" : "1px solid #ddd" }}
            onClick={() => setSelectedAddressId(a.id)}
          >
            <h3>📍 {a.label}</h3>
            <p>{a.address_line}, {a.city}</p>
            <p>{a.phone}</p>
          </div>
        ))}

        <form onSubmit={handleAddAddress} style={{ marginTop: 20 }}>
          <input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
          <input placeholder="Address line" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
          <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button type="submit">+ Add New Address</button>
        </form>

        <div style={{ marginTop: 20 }}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Payment Method
          </label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="cod">Cash on Delivery</option>
            <option value="bkash">bKash</option>
            <option value="card">Card</option>
          </select>
        </div>

        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        <button className="checkout-btn" onClick={handleContinueToPayment}>Continue to Payment</button>
      </div>
    );
  }

  if (step === "payment") {
    return (
      <div style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2>Payment</h2>

        <p>
          Order #{orderId} — Subtotal: ৳{subtotal}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button onClick={handleApplyCoupon}>Apply</button>
        </div>

        {couponError && (
          <p style={{ color: "#c62828", marginTop: 8 }}>
            {couponError}
          </p>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 18,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#f9fafb",
          }}
        >
          <h3 style={{ margin: "0 0 14px" }}>Order Summary</h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span>Subtotal</span>
            <span>৳{subtotal}</span>
          </div>

          {couponResult && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                color: "#2e7d32",
              }}
            >
              <span>Coupon Discount</span>
              <span>-৳{couponResult.discount_amount}</span>
            </div>
          )}

          <hr
            style={{
              border: 0,
              borderTop: "1px solid #ddd",
              margin: "12px 0",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "bold",
              fontSize: 18,
            }}
          >
            <span>Total Payable</span>
            <span>৳{finalAmount}</span>
          </div>

          {couponResult && (
            <p
              style={{
                margin: "12px 0 0",
                color: "#2e7d32",
                fontSize: 14,
              }}
            >
              🎉 Coupon applied successfully!
            </p>
          )}
        </div>

        <p style={{ marginTop: 16 }}>
          Payment Method: <strong>{methodLabel}</strong>
        </p>

        <p style={{ fontWeight: "bold" }}>
          Payable: ৳{finalAmount}
        </p>

        {error && (
          <p style={{ color: "#c62828" }}>
            {error}
          </p>
        )}

        <button className="checkout-btn" onClick={handlePay}>
          Confirm & Pay
        </button>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div
        style={{
          maxWidth: 420,
          margin: "40px auto",
          textAlign: "center",
        }}
      >
        <h2>✅ Order Confirmed!</h2>

        <p>
          Order #{orderId} — Paid ৳{finalAmount} via {method}
        </p>

        <button
          className="checkout-btn"
          onClick={() => setView("orders")}
        >
          Track Order
        </button>
      </div>
    );
  }

  return null;
}

export default Checkout;