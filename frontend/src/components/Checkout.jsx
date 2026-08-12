import { useEffect, useState } from "react";
import { getAddresses, addAddress } from "../api/addressApi";
import { applyCoupon, redeemCoupon, getBestCoupon } from "../api/couponApi";
import { initiatePayment, confirmPayment } from "../api/paymentApi";
import { getCurrentUserId } from "../utils/auth";  

const BASE_URL = import.meta.env.VITE_API_URL;


function Checkout({ setView, token }) {
  const [step, setStep] = useState("address"); // address -> coupon -> payment -> confirm
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const [orderId, setOrderId] = useState(null);
  const [subtotal, setSubtotal] = useState(Number(localStorage.getItem("checkout_cart_total")) || 0);

  
  const [couponResult, setCouponResult] = useState(null);
  
  const [method, setMethod] = useState("cod");
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState("");

  const [bestCoupon, setBestCoupon] = useState(null);
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

  const handleContinueToCoupon = async () => {
  if (!selectedAddressId) {
    setError("Please select or add an address first.");
    return;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/orders/create?user_id=${getCurrentUserId()}&address_id=${selectedAddressId}`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to create order");
    }

    setOrderId(data.order_id);
    setSubtotal(data.total);

    // Automatically find and apply the best available coupon for the user
    try {
      const couponData = await getBestCoupon(Number(data.total));

      if (couponData?.best_coupon) {
        setBestCoupon(couponData.best_coupon);

        const applied = await applyCoupon(
          couponData.best_coupon.code,
          Number(data.total)
        );

        setCouponResult(applied);
        
      } else {
        setBestCoupon(null);
        setCouponResult(null);
      }
    } catch (couponErr) {
      console.error("Could not automatically apply coupon:", couponErr);

      
      setBestCoupon(null);
      setCouponResult(null);
    }

    setStep("coupon");
  } catch (err) {
    setError(err.message);
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

  if (step === "address") {
    return (
      <div className="address-page">
        <h2>Select Delivery Address</h2>
        {addresses.map((a) => (
          <div key={a.id} className="address-item" style={{ border: selectedAddressId === a.id ? "2px solid #ff6b35" : "1px solid #ddd" }} onClick={() => setSelectedAddressId(a.id)}>
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

        {error && <p style={{ color: "#c62828" }}>{error}</p>}
        <button className="checkout-btn" onClick={handleContinueToCoupon}>Continue to Coupon</button>
      </div>
    );
  }
  if (step === "coupon") {
    return (
    <div className="bb-page">
      <div className="bb-header">
        <div className="bb-logo">
          <span className="bb-burger">☰</span>
          <span>BiteBuddy</span>
        </div>

        <span className="bb-header-icon">🎟️</span>
      </div>

      <main className="bb-card bb-coupon-card">
        <div className="bb-page-heading">
          <span className="bb-eyebrow">SPECIAL OFFER</span>

          <h1>Your Coupons</h1>

          <p>
            {couponResult
              ? `Your best coupon ${couponResult.code} has been applied automatically.`
              : "No eligible coupon is available for this order."}
          </p>
        </div>

        {couponResult ? (
  <div className="bb-coupon-result">
    <div>
      <span>Applied Coupon</span>
      <strong>{couponResult.code}</strong>
    </div>

    <div>
      <span>Discount</span>
      <strong>
        -৳{couponResult.discount_amount}
      </strong>
    </div>

    <div className="bb-total-row">
      <span>Total Payable</span>
      <strong>
        ৳{couponResult.total}
      </strong>
    </div>

    <p
      style={{
        marginTop: 14,
        color: "#2e7d32",
        fontWeight: 600,
      }}
    >
      🎉 Coupon applied successfully!
    </p>
  </div>
) : (
  <div className="bb-empty-state">
    <div className="bb-empty-icon">🎟️</div>

    <p>
      No eligible coupon is available for this order.
    </p>
  </div>
)}

        <div style={{ marginTop: 24 }}>
          {couponResult ? (
            <button
              className="bb-primary-button"
              onClick={() => setStep("payment")}
            >
              Continue to Payment
            </button>
          ) : (
            <button
              className="bb-outline-button"
              onClick={() => setStep("payment")}
            >
              Continue Without Coupon
            </button>
          )}
        </div>
      </main>
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
            <span>
              Coupon Discount ({couponResult.code})
            </span>

            <span>
              -৳{couponResult.discount_amount}
            </span>
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
            🎉 {couponResult.code} applied automatically!
          </p>
        )}
      </div>

      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        style={{ marginTop: 20 }}
      >
        <option value="cod">Cash on Delivery</option>
        <option value="bkash">bKash</option>
        <option value="card">Card</option>
      </select>

      <p style={{ fontWeight: "bold" }}>
        Payable: ৳{finalAmount}
      </p>

      {error && (
        <p style={{ color: "#c62828" }}>
          {error}
        </p>
      )}

      <button
        className="checkout-btn"
        onClick={handlePay}
      >
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