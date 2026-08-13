import { useEffect, useState } from "react";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../api/addressApi";

const LABEL_OPTIONS = [
  { value: "Home", icon: "🏠" },
  { value: "Work", icon: "🏢" },
  { value: "Other", icon: "📍" },
];

const EMPTY_FORM = {
  label: "Home",
  customLabel: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  phone: "",
  deliveryInstructions: "",
  isDefault: false,
};

function AddressBook({ token }) {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const startEdit = (a) => {
    setForm({
      label: a.label,
      customLabel: a.custom_label || "",
      addressLine1: a.address_line1,
      addressLine2: a.address_line2 || "",
      city: a.city,
      postalCode: a.postal_code || "",
      phone: a.phone,
      deliveryInstructions: a.delivery_instructions || "",
      isDefault: a.is_default,
    });
    setEditingId(a.id);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.addressLine1.trim() || !form.city.trim() || !form.phone.trim()) {
      setError("House/Road, City, and Phone are required.");
      return;
    }
    if (form.label === "Other" && !form.customLabel.trim()) {
      setError('Please name this "Other" address (e.g. Gym, Friend\'s place).');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateAddress(token, editingId, form);
      } else {
        await addAddress(token, form);
      }
      resetForm();
      await loadAddresses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      await deleteAddress(token, id);
      if (editingId === id) resetForm();
      loadAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(token, id);
      loadAddresses();
    } catch (err) {
      setError(err.message);
    }
  };

  const isFirstAddress = addresses.length === 0;

  if (!token) {
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
        <div className="empty-state">
          <h3>🔒 Please log in</h3>
          <p>You need an account to save and manage delivery addresses.</p>
        </div>
      </div>
    );
  }

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
        <h3>{editingId ? "Edit Address" : "Add a New Address"}</h3>
        <p>Save your home, office or other delivery locations.</p>

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <div className="address-label-row">
            {LABEL_OPTIONS.map((opt) => (
              <button
                type="button"
                key={opt.value}
                className={`address-label-chip${form.label === opt.value ? " active" : ""}`}
                onClick={() => updateField("label", opt.value)}
              >
                {opt.icon} {opt.value}
              </button>
            ))}
          </div>

          {form.label === "Other" && (
            <input
              className="address-input"
              type="text"
              placeholder="Name this address (e.g. Gym, Friend's place)"
              value={form.customLabel}
              onChange={(e) => updateField("customLabel", e.target.value)}
            />
          )}

          <input
            className="address-input"
            type="text"
            placeholder="House / Flat / Road"
            value={form.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
          />
          <input
            className="address-input"
            type="text"
            placeholder="Area / Landmark (optional)"
            value={form.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
          />

          <div className="address-form-grid">
            <input
              className="address-input"
              type="text"
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
            />
            <input
              className="address-input"
              type="text"
              placeholder="Postal code (optional)"
              value={form.postalCode}
              onChange={(e) => updateField("postalCode", e.target.value)}
            />
          </div>

          <input
            className="address-input"
            type="text"
            placeholder="Phone number"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <textarea
            className="address-input address-textarea"
            placeholder="Delivery instructions (optional) — e.g. Ring the bell twice, leave at gate"
            value={form.deliveryInstructions}
            onChange={(e) => updateField("deliveryInstructions", e.target.value)}
            rows={2}
          />

          {isFirstAddress ? (
            <p className="address-default-note">⭐ This will be set as your default address.</p>
          ) : (
            <label className="address-checkbox-row">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => updateField("isDefault", e.target.checked)}
              />
              Set as default address
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="primary-btn" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Address"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-btn"
              style={{ width: "100%", marginTop: 10 }}
              onClick={resetForm}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

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
          {addresses.map((a) => {
            const labelIcon = LABEL_OPTIONS.find((o) => o.value === a.label)?.icon || "📍";
            return (
              <div
                key={a.id}
                className={`address-item${a.is_default ? " is-default" : ""}`}
              >
                <div className="address-item-header">
                  <h3>
                    {labelIcon} {a.display_label}
                  </h3>
                  {a.is_default && <span className="default-badge">Default</span>}
                </div>

                <p>🏠 {a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ""}</p>
                <p>🌆 {a.city}{a.postal_code ? ` - ${a.postal_code}` : ""}</p>
                <p>📞 {a.phone}</p>
                {a.delivery_instructions && (
                  <p className="delivery-instructions-note">📝 {a.delivery_instructions}</p>
                )}

                <div className="address-actions">
                  <button className="secondary-btn" onClick={() => startEdit(a)}>
                    ✏️ Edit
                  </button>
                  {!a.is_default && (
                    <button className="secondary-btn" onClick={() => handleSetDefault(a.id)}>
                      ⭐ Set as Default
                    </button>
                  )}
                  <button className="secondary-btn" onClick={() => handleDelete(a.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AddressBook;