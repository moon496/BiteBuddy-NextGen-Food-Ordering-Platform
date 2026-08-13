const BASE_URL = import.meta.env.VITE_API_URL;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

// addressData shape:
// {
//   label,            // "Home" | "Work" | "Other"
//   customLabel,      // only used when label === "Other"
//   addressLine1,      // House/Flat/Road
//   addressLine2,      // Area/Landmark (optional)
//   city,
//   postalCode,        // optional
//   phone,
//   deliveryInstructions, // optional
//   isDefault,
// }
const toPayload = (addressData) => ({
  label: addressData.label,
  custom_label: addressData.customLabel || null,
  address_line1: addressData.addressLine1,
  address_line2: addressData.addressLine2 || null,
  city: addressData.city,
  postal_code: addressData.postalCode || null,
  phone: addressData.phone,
  delivery_instructions: addressData.deliveryInstructions || null,
  is_default: !!addressData.isDefault,
});

export const getAddresses = async (token) => {
  const res = await fetch(`${BASE_URL}/addresses`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load addresses");
  const data = await res.json();
  return data.addresses;
};

export const addAddress = async (token, addressData) => {
  const res = await fetch(`${BASE_URL}/addresses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(toPayload(addressData)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to add address");
  return data;
};

export const updateAddress = async (token, addressId, addressData) => {
  const res = await fetch(`${BASE_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(toPayload(addressData)),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to update address");
  return data;
};

export const setDefaultAddress = async (token, addressId) => {
  const res = await fetch(`${BASE_URL}/addresses/${addressId}/default`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to set default address");
  return data;
};

export const deleteAddress = async (token, addressId) => {
  const res = await fetch(`${BASE_URL}/addresses/${addressId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete address");
  return res.json();
};
