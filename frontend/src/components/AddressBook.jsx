import { useEffect, useState } from "react";
import { getAddresses, addAddress, deleteAddress } from "../api/addressApi";

function AddressBook({ token }) {
  const [addresses, setAddresses] = useState([]);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses(token);
      setAddresses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAddresses();
  }, [token]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim() || !addressLine.trim() || !city.trim() || !phone.trim()) return;

    try {
      await addAddress(token, label, addressLine, city, phone);
      setLabel("");
      setAddressLine("");
      setCity("");
      setPhone("");
      loadAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAddress(token, id);
      loadAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="address-page">
      <div className="page-hero">
        <div className="page-hero-content">
          <div className="brand-header">
            <span className="menu-icon">🍔</span>
            <div>
              <h2 className="brand-title">BiteBuddy</h2>
              <p className="brand-tagline">Delicious food, delivered fast.</p>
            </div>
          </div>

          <div className="hero-text">
            <h1>📍 Saved Addresses</h1>
            <p>Manage your delivery locations for faster and hassle-free checkout.</p>
          </div>
        </div>
      </div>

      <h2 className="section-title">Your Saved Locations</h2>

      <div className="address-card">
        <h3>Add a New Address</h3>
        <p>Save your home, office or other delivery locations.</p>

        <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
          <input
            className="address-input"
            type="text"
            placeholder="Label (Home, Work...)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <input
            className="address-input"
            type="text"
            placeholder="Address line"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
          />
          <input
            className="address-input"
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            className="address-input"
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button type="submit" className="primary-btn">
            Add Address
          </button>
        </form>
      </div>

      {error && <p className="auth-error">{error}</p>}

      {loading ? (
        <div className="empty-state">
          <h3>⏳ Loading...</h3>
          <p>Please wait while we fetch your saved addresses.</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="empty-state">
          <h3>📍 No Saved Addresses</h3>
          <p>Add your first address to make ordering faster.</p>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map((a) => (
            <div key={a.id} className="address-item">
              <h3>📍 {a.label}</h3>
              <p>🏠 {a.address_line}</p>
              <p>🌆 {a.city}</p>
              <p>📞 {a.phone}</p>
              <button className="secondary-btn" onClick={() => handleDelete(a.id)}>
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressBook;