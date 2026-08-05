function Dashboard({ setView }) {
  const cards = [
    { key: "menu", title: "Browse Menu", desc: "Explore our delicious food items.", icon: "🍔" },
    { key: "cart", title: "Your Cart", desc: "Review items before checkout.", icon: "🛒" },
    { key: "orders", title: "Track Order", desc: "See your order's live status.", icon: "📦" },
    { key: "account", title: "Account", desc: "Manage your profile and login.", icon: "👤" },
    { key: "addresses", title: "Addresses", desc: "Manage delivery addresses.", icon: "📍" },
    { key: "reviews", title: "Reviews", desc: "See what customers are saying.", icon: "⭐" },
    { key: "coupon", title: "Coupons", desc: "Check available discounts.", icon: "🏷️" },
  ];

  return (
    <div className="home-dashboard">
      <div className="home-hero">
        <div className="home-hero-text">
          <h1>Welcome to BiteBuddy 🍔</h1>
          <p>Delicious food, delivered fast. Pick a section below to get started.</p>
        </div>
        <div className="home-hero-image">
          <img
            src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500"
            alt="Burger"
          />
        </div>
      </div>

      <div className="home-grid">
        {cards.map((card) => (
          <button
            key={card.key}
            className="home-card"
            onClick={() => setView(card.key)}
          >
            <span className="home-card-icon">{card.icon}</span>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;