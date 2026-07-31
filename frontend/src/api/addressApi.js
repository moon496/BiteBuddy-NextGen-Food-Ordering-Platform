const BASE_URL = "http://127.0.0.1:8000";
const USER_ID = 1;

export const getAddresses = async () => {
  const res = await fetch(`${BASE_URL}/addresses/${USER_ID}`);
  const data = await res.json();
  return data.addresses;
};

export const addAddress = async (label, addressLine, city, phone) => {
  const res = await fetch(`${BASE_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: USER_ID,
      label,
      address_line: addressLine,
      city,
      phone,
    }),
  });
  return res.json();
};

export const updateAddress = async (addressId, label, addressLine, city, phone) => {
  const res = await fetch(`${BASE_URL}/addresses/${USER_ID}/${addressId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ label, address_line: addressLine, city, phone }),
  });
  return res.json();
};

export const deleteAddress = async (addressId) => {
  const res = await fetch(`${BASE_URL}/addresses/${USER_ID}/${addressId}`, {
    method: "DELETE",
  });
  return res.json();
};
