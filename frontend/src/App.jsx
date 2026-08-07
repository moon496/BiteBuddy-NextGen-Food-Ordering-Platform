
import { useState } from "react";
import "./App.css";
import "./Layout.css";


import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import MenuItems from "./components/MenuItems";
import CartPage from "./components/cartpage";
import Login from "./components/Login";
import OrderStatus from "./components/OrderStatus";
import AddressBook from "./components/AddressBook";
import AdminDashboard from "./components/AdminDashboard";
import Coupon from "./components/Coupon";
import Reviews from "./components/Reviews";
import Payment from "./components/Payment";
import Checkout from "./components/Checkout";

function App() {
  const [view, setView] = useState("dashboard");

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} />


      <div className="app-main">
        <div className="app-content">
          {view === "dashboard" && <Dashboard setView={setView} />}
          {view === "menu" && <MenuItems />}
          {view === "cart" && <CartPage setView={setView} />}
          {view === "orders" && <OrderStatus />}
          {view === "account" && <Login setView={setView} />}
          {view === "payment" && <Payment />}
          {view === "addresses" && <AddressBook />}
          {view === "admin" && <AdminDashboard />}
          {view === "coupon" && <Coupon />}
          {view === "reviews" && <Reviews />}
          {view === "checkout" && <Checkout setView={setView} />}
        </div>

        <Footer />
      </div>

    </div>
  );
}

export default App;