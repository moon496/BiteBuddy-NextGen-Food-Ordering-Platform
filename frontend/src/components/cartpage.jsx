import { useEffect, useState } from "react";
import { getCart, updateCartItem, removeCartItem } from "../api/cartApi";

function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    setLoading(true);
    const data = await getCart();
    setCartItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleQuantityChange = async (cartId, newQty) => {
    if (newQty < 1) return;
    await updateCartItem(cartId, newQty);
    fetchCart();
  };

  const handleRemove = async (cartId) => {
    await removeCartItem(cartId);
    fetchCart();
  };

  if (loading) return <p>Loading cart...</p>;

  const total = cartItems.reduce((sum, c) => sum + c.subtotal, 0);

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {cartItems.map((c) => (
            <div key={c.id} className="cart-item">
              <span>{c.item_name}</span>
              <span>৳{c.price}</span>
              <button onClick={() => handleQuantityChange(c.id, c.quantity - 1)}>-</button>
              <span>{c.quantity}</span>
              <button onClick={() => handleQuantityChange(c.id, c.quantity + 1)}>+</button>
              <span>৳{c.subtotal}</span>
              <button onClick={() => handleRemove(c.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: ৳{total}</h3>
        </>
      )}
    </div>
  );
}

export default CartPage;