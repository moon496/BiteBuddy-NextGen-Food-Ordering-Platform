
 import { useState } from "react";
import './App.css'
import MenuItems from "./components/MenuItems";
import CartPage from "./components/cartpage";

import Login from "./components/Login";
import OrderStatus from "./components/OrderStatus";
import Coupon from "./components/Coupon";
import AddressBook from "./components/AddressBook";
import AdminDashboard from "./components/AdminDashboard";
import Reviews from "./components/Reviews";
import Payment from "./components/Payment";

function App() {
  const [view, setView] = useState("menu");

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #444" }}>
        <button onClick={() => setView("menu")}>Menu</button>
        <button onClick={() => setView("cart")}>Cart</button>
        <button onClick={() => setView("orders")}>Track Order</button>
        <button onClick={() => setView("coupon")}>Coupon</button>
        <button onClick={() => setView("addresses")}>Addresses</button>
        <button onClick={() => setView("admin")}>Admin Dashboard</button>
        <button onClick={() => setView("reviews")}>Reviews</button>
        <button onClick={() => setView("payment")}>Payment</button>
        <button onClick={() => setView("account")}>Account</button>
      </nav>

      {view === "menu" && <MenuItems />}
      {view === "cart" && <CartPage setView={setView} />}
      {view === "orders" && <OrderStatus />}
      {view === "coupon" && <Coupon />}
      {view === "addresses" && <AddressBook />}
      {view === "admin" && <AdminDashboard />}
      {view === "reviews" && <Reviews />}
      {view === "payment" && <Payment />}
      {view === "account" && <Login setView={setView} />}
    </div>
  );
}

export default App;