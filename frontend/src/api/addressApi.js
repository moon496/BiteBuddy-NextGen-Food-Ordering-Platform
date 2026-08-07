const BASE_URL = import.meta.env.VITE_API_URL;

const authHeaders = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const getAddresses = async (token) => {
  const res = await fetch(`${BASE_URL}/addresses`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to load addresses");
  const data = await res.json();
  return data.addresses;
};

export const addAddress = async (token, label, addressLine, city, phone) => {
  const res = await fetch(`${BASE_URL}/addresses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      label,
      address_line: addressLine,
      city,
      phone,
    }),
  });
  if (!res.ok) throw new Error("Failed to add address");
  return res.json();
};

export const updateAddress = async (token, addressId, label, addressLine, city, phone) => {
  const res = await fetch(`${BASE_URL}/addresses/${addressId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ label, address_line: addressLine, city, phone }),
  });
  if (!res.ok) throw new Error("Failed to update address");
  return res.json();
};

export const deleteAddress = async (token, addressId) => {
  const res = await fetch(`${BASE_URL}/addresses/${addressId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete address");
  return res.json();
};