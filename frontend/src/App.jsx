import { useState } from "react";
import './App.css';

import Payment from "./components/Payment";
import MenuItems from "./components/MenuItems";
import CartPage from "./components/cartpage";
import Login from "./components/Login";
import OrderStatus from "./components/OrderStatus";
import AddressBook from "./components/AddressBook";
import AdminDashboard from "./components/AdminDashboard";
import Coupon from "./components/Coupon";
import Reviews from "./components/Reviews";

function App() {
  const [view, setView] = useState("menu");

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #444" }}>
        <button onClick={() => setView("menu")}>Menu</button>
        <button onClick={() => setView("cart")}>Cart</button>
        <button onClick={() => setView("orders")}>Track Order</button>
        <button onClick={() => setView("account")}>Account</button>
        <button onClick={() => setView("reviews")}>Reviews</button>
        <button
          onClick={() => {
            const role = localStorage.getItem("bitebuddy_role");

            if (role === "Admin") {
              setView("admin");
            } else {
              alert("Access denied. Admins only.");
            }
          }}
        >
          Admin
        </button>
        <button onClick={() => setView("addresses")}>Addresses</button>
        <button onClick={() => setView("coupon")}>Coupon</button>
      </nav>

      {view === "menu" && <MenuItems />}
      {view === "cart" && <CartPage setView={setView} />}
      {view === "orders" && <OrderStatus />}
      {view === "account" && <Login setView={setView} />}
      {view === "payment" && <Payment />}
      {view === "addresses" && <AddressBook />}
      {view === "admin" && <AdminDashboard />}
      {view === "coupon" && <Coupon />}
      {view === "reviews" && <Reviews />}
    </div>
  );
}

export default App;