function Sidebar({ view, setView }) {
  const isAdmin = localStorage.getItem("bitebuddy_role") === "Admin";

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "menu", label: "Menu", icon: "🍔" },
    { key: "cart", label: "Cart", icon: "🛒" },
    { key: "orders", label: "Track Order", icon: "📦" },
    { key: "account", label: "Account", icon: "👤" },
    { key: "reviews", label: "Reviews", icon: "⭐" },
    { key: "addresses", label: "Addresses", icon: "📍" },
    { key: "coupon", label: "Coupon", icon: "🏷️" },
  ];

  const handleAdminClick = () => {
    if (isAdmin) {
      setView("admin");
    } else {
      alert("Access denied. Admins only.");
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">🍔</span>
        <span className="sidebar-brand-text">BiteBuddy</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={view === item.key ? "sidebar-item active" : "sidebar-item"}
            onClick={() => setView(item.key)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <button
          className={view === "admin" ? "sidebar-item active" : "sidebar-item"}
          onClick={handleAdminClick}
        >
          <span className="sidebar-icon">🛠️</span>
          Admin
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;