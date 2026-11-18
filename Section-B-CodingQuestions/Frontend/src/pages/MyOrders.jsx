import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const statusColors = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/my-orders', {
        params: { page, limit: 10 },
      });
      const data = res.data?.data || res.data;
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div>
      <h2>My Orders</h2>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <span><strong>Order:</strong> {order._id}</span>
              <span>
                <strong>Date:</strong>{' '}
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
              <span
                className="status-badge"
                style={{
                  color: '#fff',
                  backgroundColor: statusColors[order.status] || '#888',
                }}
              >
                {order.status}
              </span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="order-total">
              <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
            </p>
          </div>
        ))
      )}

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default MyOrders;

