import { useState, useEffect  } from "react";
import { applyCoupon, myCoupons  } from "../api/couponApi";

function Coupon() {
  const [code, setCode] = useState("");
  const [subtotal, setSubtotal] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [personalCoupons, setPersonalCoupons] = useState([]);

  useEffect(() => {
    myCoupons().then(setPersonalCoupons);
  }, []);

  const handleApply = async () => {
    setError("");
    setResult(null);
    if (!code.trim() || !subtotal) return;

    try {
      const data = await applyCoupon(code.trim(), parseFloat(subtotal));
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
  <div className="styled-page" style={{ maxWidth: 480, margin: "40px auto", padding: 20 }}>
    <h2>My Coupons</h2>

    {personalCoupons.length === 0 ? (
        <p style={{ color: "#888", fontSize: 14 }}>
          You don't have any personal coupons yet. Complete orders to earn loyalty rewards!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {personalCoupons.map((c) => (
            <div
              key={c.id}
              onClick={() => setCode(c.code)}
              style={{
                cursor: "pointer",
                border: "1px dashed #ff6b35",
                borderRadius: 8,
                padding: 12,
                background: "#fff6ee",
              }}
            >
              <strong>{c.code}</strong> —{" "}
              {c.discount_type === "percent" ? `${c.value}% off` : `৳${c.value} off`}
              {c.max_discount ? ` (max ৳${c.max_discount})` : ""}
              <div style={{ fontSize: 12, color: "#888" }}>Click to use this code</div>
            </div>
          ))}
        </div>
      )}

      <h2>Apply a Coupon</h2>
      <p style={{ color: "#888", fontSize: 14 }}>
        Try: WELCOME10, SAVE50, , or a personal coupon above
      </p>

      <input
        type="text"
        placeholder="Coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <input
        type="number"
        placeholder="Cart subtotal (e.g. 500)"
        value={subtotal}
        onChange={(e) => setSubtotal(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <button onClick={handleApply} style={{ padding: "10px 18px" }}>
        Apply Coupon
      </button>

      {error && <p style={{ color: "#c62828", fontWeight: "bold" }}>{error}</p>}

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
          }}
        >
          <p>Code: <strong>{result.code}</strong></p>
          <p>Subtotal: ৳{result.subtotal}</p>
          <p>Discount: -৳{result.discount_amount}</p>
          <h3>Total: ৳{result.total}</h3>
        </div>
      )}
    </div>
  );
}

export default Coupon;
