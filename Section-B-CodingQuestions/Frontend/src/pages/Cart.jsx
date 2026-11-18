import React, { useState } from 'react';
import api from '../api/axios';

const Cart = ({ cart, setCart }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      const updated = prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (productId) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.productId !== productId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
      await api.post('/orders/checkout', { items });
      setCart([]);
      localStorage.removeItem('cart');
      setSuccess('Order placed successfully!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Checkout failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    return (
      <div>
        <h2>Cart</h2>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Cart</h2>
      {error && <p className="error-msg">{error}</p>}
      {success && <p className="success-msg">{success}</p>}

      {cart.length > 0 && (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-sm"
                      onClick={() => updateQuantity(item.productId, -1)}
                    >
                      -
                    </button>
                    <span style={{ margin: '0 0.5rem' }}>{item.quantity}</span>
                    <button
                      className="btn-sm"
                      onClick={() => updateQuantity(item.productId, 1)}
                      disabled={item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-sm btn-danger"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-total">
            <strong>Total: ${total.toFixed(2)}</strong>
          </div>

          <button className="btn" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;

