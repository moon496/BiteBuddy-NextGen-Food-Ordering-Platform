import { useEffect, useState } from "react";
import { getAddresses, addAddress, deleteAddress } from "../api/addressApi";

function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [label, setLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  const loadAddresses = async () => {
    setLoading(true);
    const data = await getAddresses();
    setAddresses(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!label.trim() || !addressLine.trim() || !city.trim() || !phone.trim()) return;

    await addAddress(label, addressLine, city, phone);
    setLabel("");
    setAddressLine("");
    setCity("");
    setPhone("");
    loadAddresses();
  };

  const handleDelete = async (id) => {
    await deleteAddress(id);
    loadAddresses();
  };

  return (
   <div className="styled-page" style={{ maxWidth: 500, margin: "40px auto", padding: 20 }}>
      <h2>Delivery Addresses</h2>

      <form onSubmit={handleAdd} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Label (Home, Work...)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Address line"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <input
          type="text"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />
        <button type="submit" style={{ padding: "10px 18px" }}>
          Add Address
        </button>
      </form>

      {loading ? (
        <p>Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p>No saved addresses yet.</p>
      ) : (
        addresses.map((a) => (
          <div
            key={a.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <strong>{a.label}</strong>
            <p>{a.address_line}, {a.city}</p>
            <p>{a.phone}</p>
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
}

export default AddressBook;
