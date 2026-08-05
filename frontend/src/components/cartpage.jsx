import { useEffect, useState } from "react";
import "../App.css";

const BASE_URL = import.meta.env.VITE_API_URL;
const USER_ID = 1;

function CartPage({ setView }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleGoToLogin = () => {
    localStorage.setItem("checkout_redirect", "addresses");
    setShowLoginPrompt(false);
    setView("account");
  };

  const loadCart = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cart/${USER_ID}`);
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

  const handleQuantityChange = async (id, delta) => {
    const item = cartItems.find((c) => c.id === id);
    const newQuantity = Math.max(1, item.quantity + delta);

    try {
      await fetch(`${BASE_URL}/cart/${USER_ID}/${id}`, {
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
      await fetch(`${BASE_URL}/cart/${USER_ID}/${id}`, {
        method: "DELETE",
      });
      loadCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("bitebuddy_token");
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch(`${BASE_URL}/orders/create?user_id=${USER_ID}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Failed to place order");
        return;
      }

      alert(`Order placed! Your Order ID is ${data.order_id}`);
      loadCart();
    } catch (err) {
      console.error("Failed to place order:", err);
      alert("Something went wrong placing the order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <p>Loading cart...</p>;

  const total = cartItems.reduce((sum, c) => sum + c.subtotal, 0);

  return (
  <div className="cart-page">
    <div className="cart-brand-header">
      <span className="menu-brand-mark">🍔</span>

      <h1 className="menu-brand-name">BiteBuddy</h1>

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

          <button
            className="checkout-btn"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </>
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