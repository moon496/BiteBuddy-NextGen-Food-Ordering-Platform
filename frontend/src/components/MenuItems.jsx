import { useEffect, useState } from "react";
import { getCurrentUserId } from "../utils/auth";


const BASE_URL = import.meta.env.VITE_API_URL;


function MenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); 
  
  useEffect(() => {
    console.log("BASE_URL:", BASE_URL);

    fetch(`${BASE_URL}/menu-items`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server responded with ${res.status}`);
        console.log("STATUS:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("MENU DATA:", data);
        setItems(data.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("FETCH ERROR:", err);
        setError("Could not load menu.");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (itemId, itemName) => {
    try {
     const res = await fetch(`${BASE_URL}/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: getCurrentUserId(), item_id: itemId, quantity: 1 }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.detail || `Failed to add item (status ${res.status})`);
    }

    setMessage(`${itemName} added to cart!`);
    setTimeout(() => setMessage(""), 2000);
  } catch (err) {
    console.error("Error adding to cart:", err.message);
    setMessage(err.message || "Failed to add item to cart.");
    setTimeout(() => setMessage(""), 2000);
  }
};

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="menu-items">
      <div className="menu-brand-header">
         <span className="menu-brand-mark">🍔</span>
         <h1 className="brand-title">BiteBuddy</h1>
         <p className="menu-brand-tagline">Our Menu</p>
      </div>

      {message && (
        <div
          style={{
            background: "#2e7d32",
            color: "white",
            padding: "10px 15px",
            borderRadius: "6px",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}




      <div className="menu-grid">
        {items.map((item) => (
          <div className="menu-card" key={item.id}>
            {item.image && (
              <img className="menu-card-img" src={item.image} alt={item.name} />
            )}
            <div className="menu-card-body">
              <span className="menu-card-category">{item.category}</span>
              <h3>{item.name}</h3>
              <p className="menu-card-price">৳{item.price}</p>
              <button onClick={() => handleAddToCart(item.id, item.name)}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;