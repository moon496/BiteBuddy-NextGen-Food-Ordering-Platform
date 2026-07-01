import { useEffect, useState } from "react";

function MenuItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/menu-items")
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

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="menu-items">
      <h2>Our Menu</h2>
      <div className="menu-grid">
        {items.map((item) => (
          <div className="menu-card" key={item.id}>
            <h3>{item.name}</h3>
            <p>Category: {item.category}</p>
            <p>Price: ৳{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItems;