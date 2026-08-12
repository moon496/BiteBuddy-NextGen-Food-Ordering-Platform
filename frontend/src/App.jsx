import { useState, useEffect } from "react";
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
import NotificationModal from "./components/NotificationModal";

function App() {
  const [view, setView] = useState("dashboard");

  const [token, setToken] = useState(() => localStorage.getItem("bitebuddy_token"));
  const [welcomeCoupon, setWelcomeCoupon] = useState(null);

  useEffect(() => {
    const syncToken = () => setToken(localStorage.getItem("bitebuddy_token"));
    window.addEventListener("storage", syncToken);
    return () => window.removeEventListener("storage", syncToken);
  }, []);

  return (
    <div className="app-shell">
      <Sidebar view={view} setView={setView} />

  <div className="app-main">
    <div className="app-content">

      {view === "dashboard" && <Dashboard setView={setView} />}

      {view === "menu" && <MenuItems setView={setView} />}

      {view === "cart" && <CartPage setView={setView} />}

      {view === "orders" && <OrderStatus />}

      {view === "account" && (
        <Login
          setView={setView}
          token={token}
          setToken={setToken}
          onWelcomeCoupon={setWelcomeCoupon}
        />
      )}

      {view === "payment" && <Payment />}

      {view === "addresses" && <AddressBook token={token} />}

      {view === "admin" && <AdminDashboard />}

      {view === "coupon" && <Coupon />}

      {view === "reviews" && <Reviews />}

      {view === "checkout" && (
        <Checkout
          setView={setView}
          token={token}
        />
      )}

    </div>
    {welcomeCoupon && (
      <NotificationModal
        title="🎉 Congratulations!"
        message={`You have received a special welcome coupon: ${welcomeCoupon.code} — ${welcomeCoupon.value}% OFF!`}
        icon="🎟️"
        onClose={() => setWelcomeCoupon(null)}
      />
    )}


        <Footer />
      </div>
    </div>
  );
}

export default App;