import { useEffect, useRef, useState } from "react";
import "../App.css";
import NotificationModal from "./NotificationModal";
import { getCurrentUserId } from "../utils/auth";
import { getBestCoupon } from "../api/couponApi";

const BASE_URL = import.meta.env.VITE_API_URL;


function CartPage({ setView }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [notification, setNotification] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponPopup, setShowCouponPopup] = useState(false);
  const couponPopupShown = useRef(false);

  const handleGoToLogin = () => {
    localStorage.setItem("checkout_redirect",  "checkout");
    setShowLoginPrompt(false);
    setView("account");
  };

  const loadCart = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cart/${getCurrentUserId()}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setCartItems(data.items);
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);
  useEffect(() => {
  const fetchBestCoupon = async () => {
    if (!cartItems.length) {
      setAppliedCoupon(null);
      return;
    }

    try {
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      const couponData = await getBestCoupon(subtotal);

      console.log(
        "BEST COUPON RESPONSE:",
        JSON.stringify(couponData, null, 2)
      );

      setAppliedCoupon(couponData);

      // Show coupon popup once when entering the cart
      if (couponData?.best_coupon && !couponPopupShown.current) {
        setShowCouponPopup(true);
        couponPopupShown.current = true;
      }
    } catch (err) {
      console.log("No best coupon available:", err.message);
      setAppliedCoupon(null);
    }
  };

  fetchBestCoupon();
}, [cartItems]);

  const handleQuantityChange = async (id, delta) => {
    const item = cartItems.find((c) => c.id === id);
    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      await fetch(`${BASE_URL}/cart/${getCurrentUserId()}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      loadCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handleRemove = async (id) => {
    try {
      await fetch(`${BASE_URL}/cart/${getCurrentUserId()}/${id}`, {
        method: "DELETE",
      });
      loadCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const total = cartItems.reduce((sum, c) => sum + c.subtotal, 0);

  const handlePlaceOrder = () => {
    const token = localStorage.getItem("bitebuddy_token");
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    localStorage.setItem("checkout_cart_total", total);
    if (appliedCoupon?.best_coupon) {
      localStorage.setItem(
        "selected_coupon",
         JSON.stringify(appliedCoupon.best_coupon)
      );
    } else {
      localStorage.removeItem("selected_coupon");
    }

  setView("checkout");
  };

  if (loading) return <p>Loading cart...</p>;

  return (
    <div className="cart-page">
      <div className="cart-brand-header">
        <span className="menu-brand-mark">🍔</span>

        <h1 className="brand-title">BiteBuddy</h1>

        <p className="menu-brand-tagline">
          Fresh • Delicious • Ready to Order
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add some delicious food from the menu!</p>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cartItems.map((c) => (
              <div key={c.id} className="cart-card">
                <img
                  src={c.image}
                  alt={c.item_name}
                  className="cart-image"
                />

                <div className="cart-content">
                  <span className="cart-category">
                    {c.category}
                  </span>

                  <h3 className="cart-name">{c.item_name}</h3>

                  <p className="cart-price">
                    ৳{c.price} each
                  </p>

                  <div className="cart-bottom">
                    <div className="qty-box">
                      <button onClick={() => handleQuantityChange(c.id, -1)}>
                        −
                      </button>

                      <span>{c.quantity}</span>

                      <button onClick={() => handleQuantityChange(c.id, 1)}>
                        +
                      </button>
                    </div>

                    <strong>৳{c.subtotal}</strong>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(c.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-card">
            <div className="summary-row">
              <span>Items</span>
              <strong>{cartItems.length}</strong>
            </div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <strong>৳{total}</strong>
            </div>

            <div className="coupon-section">
  <div className="coupon-header">
    <span>🎟️ Coupon</span>
  </div>

  <div className="best-deal">
  <strong>🔥 Best Deal</strong>

  {appliedCoupon?.best_coupon ? (
    <>
      <span>
        {appliedCoupon.best_coupon.code} —{" "}
        {appliedCoupon.best_coupon.discount_type === "percent"
          ? `${appliedCoupon.best_coupon.discount_value}% OFF`
          : `৳${appliedCoupon.best_coupon.discount_value} OFF`}
      </span>

      <small>
        Best available coupon will be applied automatically.
      </small>
    </>
  ) : (
    <span>No applicable coupon available</span>
  )}
</div>
</div>



            <button
              className="checkout-btn"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </>
      )}
      {notification && (
        <NotificationModal
          title={notification.title}
          message={notification.message}
          icon={notification.icon}
          onClose={() => setNotification(null)}
        />
      )}

      {showCouponPopup && appliedCoupon?.best_coupon && (
  <div className="coupon-popup-overlay">
    <div className="coupon-popup-card">
      <button
        className="coupon-popup-close"
        onClick={() => setShowCouponPopup(false)}
      >
        ×
      </button>

      <div className="coupon-popup-icon">🎟️</div>

      <h2>Best Coupon For You!</h2>

      <p className="coupon-popup-code">
        {appliedCoupon.best_coupon.code}
      </p>

      <p className="coupon-popup-discount">
        {appliedCoupon.best_coupon.discount_type === "percent"
          ? `${appliedCoupon.best_coupon.discount_value}% OFF`
          : `৳${appliedCoupon.best_coupon.discount_value} OFF`}
      </p>

      <p>
        You save ৳{appliedCoupon.best_coupon.discount_amount}
      </p>

      <p className="coupon-popup-note">
        This coupon will be applied automatically before payment.
      </p>

      <button
        className="checkout-btn"
        onClick={() => setShowCouponPopup(false)}
      >
        Continue
      </button>
    </div>
  </div>
)}

      {showLoginPrompt && (
        <div className="login-modal-overlay">
          <div className="login-modal-card">
            <div className="login-modal-icon">🔒</div>
            <h3>Login Required</h3>
            <p>Please log in to place your order and continue to your delivery address.</p>
            <div className="login-modal-actions">
              <button className="login-modal-primary" onClick={handleGoToLogin}>
                Go to Login
              </button>
              <button className="login-modal-secondary" onClick={() => setShowLoginPrompt(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CartPage;