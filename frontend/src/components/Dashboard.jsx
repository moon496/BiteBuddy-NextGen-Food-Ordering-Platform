import animation from "../assets/animation.mp4";
import food from "../assets/food.jpeg";
function Dashboard({ setView }) {
  const cards = [
    {
      key: "menu",
      title: "Browse Menu",
      desc: "Explore our delicious food items.",
      icon: "🍔",
    },
    {
      key: "cart",
      title: "Your Cart",
      desc: "Review items before checkout.",
      icon: "🛒",
    },
    {
      key: "orders",
      title: "Track Order",
      desc: "See your order's live status.",
      icon: "📦",
    },
    {
      key: "account",
      title: "Account",
      desc: "Manage your profile and login.",
      icon: "👤",
    },
    {
      key: "addresses",
      title: "Addresses",
      desc: "Manage delivery addresses.",
      icon: "📍",
    },
    {
      key: "reviews",
      title: "Reviews",
      desc: "See what customers are saying.",
      icon: "⭐",
    },
    {
      key: "coupon",
      title: "Coupons",
      desc: "Check available discounts.",
      icon: "🏷️",
    },
    {
      key: "payment",
      title: "payment",
      desc: "choose your payment type",
      icon: "💵",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div className="dashboard-food-image">
          <img src={food} alt="Delicious food" />
        </div>
        <div className="dashboard-hero-content">
          <h1>
            Welcome to BiteBuddy
          </h1>
          <p>Delicious food, delivered with love.</p>
        </div>

        <div className="dashboard-hero-image">
          <video
            src={animation}
            autoPlay
            loop
            muted
            playsInline
            aria-label="BiteBuddy animated mascot"
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

