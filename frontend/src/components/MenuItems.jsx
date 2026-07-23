import { useEffect, useState } from "react";


const BASE_URL = "https://obscure-acorn-4jrxwvxx64qvh5j4q-8000.app.github.dev";
function MenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(""); 
  
  useEffect(() => {
    fetch(`${BASE_URL}/menu-items`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu items:", err);
        setError("Could not load menu.");
        setLoading(false);
      });
  }, []);

  const handleAddToCart = async (itemId, itemName) => {
    try {
      const res = await fetch(`${BASE_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: USER_ID, item_id: itemId, quantity: 1 }),
      });
      if (!res.ok) throw new Error("Failed to add item");

      setMessage(`${itemName} added to cart!`);
      setTimeout(() => setMessage(""), 2000); 
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessage("Failed to add item to cart.");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="menu-items">
      <h2>Our Menu</h2>

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
            <h3>{item.name}</h3>
            <p>Category: {item.category}</p>
            <p>Price: ৳{item.price}</p>
            <button onClick={() => handleAddToCart(item.id, item.name)}>Add to Cart</button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;