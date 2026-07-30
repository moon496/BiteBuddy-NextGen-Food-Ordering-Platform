import { useEffect, useState } from "react";
import "../App.css";

const BASE_URL = import.meta.env.VITE_API_URL;
const USER_ID = 1;

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const loadCart = async () => {
    try {
      const res = await fetch(`${BASE_URL}/cart/${USER_ID}`);
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
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cartItems.map((c) => (
            <div key={c.id} className="cart-item">
              <span>{c.item_name}</span>
              <span>৳{c.price}</span>
              <button onClick={() => handleQuantityChange(c.id, -1)}>-</button>
              <span>{c.quantity}</span>
              <button onClick={() => handleQuantityChange(c.id, 1)}>+</button>
              <span>৳{c.subtotal}</span>
              <button onClick={() => handleRemove(c.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ৳{total}</h3>
          <button onClick={handlePlaceOrder} disabled={placingOrder}>
            {placingOrder ? "Placing Order..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
}

export default CartPage;