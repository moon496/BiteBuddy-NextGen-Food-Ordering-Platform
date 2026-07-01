import { useState } from 'react'
import OrderStatus from "./components/OrderStatus";
import MenuItems from "./components/MenuItems";

import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>BiteBuddy-Nextgen-Food-Ordering-Platform</h1>
          <p>
            Order your favorite meals and track delivery status in real time.
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setShowMenu((prev) => !prev)}
        >
          {showMenu ? "Hide Menu" : "View Menu"}
        </button>
      </section>

      {showMenu && (
        <>
          <div className="ticks"></div>
          <section id="menu-items">
            <MenuItems />
          </section>
        </>
      )}

      <div className="ticks"></div>
      <section id="order-status">
         <OrderStatus />
      </section>
      <div className="ticks"></div>

    </>
  )
}

export default App