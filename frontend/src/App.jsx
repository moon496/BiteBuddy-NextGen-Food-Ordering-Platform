import { useEffect, useState } from "react";
import './App.css'
import MenuItems from "./components/MenuItems";

import Login from "./components/Login";

const BASE_URL = "https://obscure-acorn-4jrxwvxx64qvh5j4q-8000.app.github.dev";
const USER_ID = 1;

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
        </>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState("menu");

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #444" }}>
        <button onClick={() => setView("menu")}>Menu</button>
        <button onClick={() => setView("cart")}>Cart</button>
        <button onClick={() => setView("account")}>Account</button>
      </nav>

      {view === "menu" && <MenuItems />}
      {view === "cart" && <CartPage />}
      {view === "account" && <Login />}
    </div>
  );
}

export default App;
