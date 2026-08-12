import { useState, useEffect  } from "react";
import { applyCoupon, myCoupons  } from "../api/couponApi";

function Coupon() {
  const [code, setCode] = useState("");
  const token = localStorage.getItem("bitebuddy_token");
  const [subtotal, setSubtotal] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [personalCoupons, setPersonalCoupons] = useState([]);

  useEffect(() => {
    myCoupons(token).then(setPersonalCoupons).catch((err) => setError(err.message));
  }, [token]);

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
  <div className="bb-page">
    <div className="bb-header">
      <div className="bb-logo">
        <span className="bb-burger">☰</span>
        <span>BiteBuddy</span>
      </div>

      <span className="bb-header-icon">🍔</span>
    </div>

    <main className="bb-card bb-coupon-card">
      <div className="bb-page-heading">
        <span className="bb-eyebrow">SPECIAL OFFERS</span>
        <h1>My Coupons</h1>
        <p>Save more on your favourite BiteBuddy meals.</p>
      </div>

      {personalCoupons.length === 0 ? (
        <div className="bb-empty-state">
          <div className="bb-empty-icon">🎟️</div>
          <p>
            You don't have any personal coupons yet.
            Complete orders to earn loyalty rewards!
          </p>
        </div>
      ) : (
        <div className="bb-coupon-list">
          {personalCoupons.map((c) => (
            <div
              key={c.id}
              className="bb-coupon-item"
              onClick={() => setCode(c.code)}
            >
              <div className="bb-coupon-main">
                <strong>{c.code}</strong>

                <span>
                  {c.discount_type === "percent"
                    ? `${c.value}% off`
                    : `৳${c.value} off`}
                </span>

                {c.max_discount && (
                  <small>Maximum discount ৳{c.max_discount}</small>
                )}
              </div>

              <div className="bb-coupon-use">
                Click to use
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bb-divider" />

      <div className="bb-page-heading bb-small-heading">
        <span className="bb-eyebrow">DISCOUNT CODE</span>
        <h2>Apply a Coupon</h2>
        <p>
          Try WELCOME10, SAVE50, or one of your personal coupons.
        </p>
      </div>

      <div className="bb-form-group">
        <label className="bb-label">Coupon code</label>

        <input
          className="bb-input"
          type="text"
          placeholder="Enter coupon code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <div className="bb-form-group">
        <label className="bb-label">Cart subtotal</label>

        <input
          className="bb-input"
          type="number"
          placeholder="e.g. 500"
          value={subtotal}
          onChange={(e) => setSubtotal(e.target.value)}
        />
      </div>

      <button
        onClick={handleApply}
        className="bb-primary-button"
      >
        Apply Coupon
      </button>

      {error && (
        <div className="bb-message bb-error">
          {error}
        </div>
      )}

      {result && (
        <div className="bb-coupon-result">
          <div>
            <span>Coupon</span>
            <strong>{result.code}</strong>
          </div>

          <div>
            <span>Subtotal</span>
            <strong>৳{result.subtotal}</strong>
          </div>

          <div className="bb-discount-row">
            <span>Discount</span>
            <strong>-৳{result.discount_amount}</strong>
          </div>

          <div className="bb-total-row">
            <span>Total</span>
            <strong>৳{result.total}</strong>
          </div>
        </div>
      )}
    </main>
  </div>
);
}

export default Coupon;