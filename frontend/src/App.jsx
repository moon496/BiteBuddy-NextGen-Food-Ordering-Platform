import { useState } from "react";
import './App.css';

import Payment from "./components/Payment";
<button onClick={() => setView("payment")}>Payment</button>
{view === "payment" && <Payment />}
import MenuItems from "./components/MenuItems";
import CartPage from "./components/cartpage";
import Login from "./components/Login";
import OrderStatus from "./components/OrderStatus";

function App() {
  const [view, setView] = useState("menu");

  return (
    <div>
      <nav style={{ display: "flex", gap: "10px", padding: "10px", borderBottom: "1px solid #444" }}>
        <button onClick={() => setView("menu")}>Menu</button>
        <button onClick={() => setView("cart")}>Cart</button>
        <button onClick={() => setView("orders")}>Track Order</button>
        <button onClick={() => setView("account")}>Account</button>
      </nav>

      {view === "menu" && <MenuItems />}
      {view === "cart" && <CartPage />}
      {view === "orders" && <OrderStatus />}
      {view === "account" && <Login />}
    </div>
  );
}

export default App;