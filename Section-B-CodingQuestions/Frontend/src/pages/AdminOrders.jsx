import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const statusColors = {
  PENDING: 'orange',
  CONFIRMED: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/orders', { params });
      const data = res.data?.data || res.data;
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const renderActions = (order) => {
    switch (order.status) {
      case 'PENDING':
        return (
          <>
            <button
              className="btn-sm btn-confirm"
              onClick={() => updateStatus(order._id, 'CONFIRMED')}
            >
              Confirm
            </button>
            <button
              className="btn-sm btn-danger"
              onClick={() => updateStatus(order._id, 'CANCELLED')}
            >
              Cancel
            </button>
          </>
        );
      case 'CONFIRMED':
        return (
          <>
            <button
              className="btn-sm btn-ship"
              onClick={() => updateStatus(order._id, 'SHIPPED')}
            >
              Ship
            </button>
            <button
              className="btn-sm btn-danger"
              onClick={() => updateStatus(order._id, 'CANCELLED')}
            >
              Cancel
            </button>
          </>
        );
      case 'SHIPPED':
        return (
          <button
            className="btn-sm btn-deliver"
            onClick={() => updateStatus(order._id, 'DELIVERED')}
          >
            Deliver
          </button>
        );
      default:
        return <span>—</span>;
    }
  };

  return (
    <div>
      <h2>All Orders</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td title={order._id}>
                  {order._id.slice(-8)}
                </td>
                <td>{order.user?.fullName || order.user?.email || '—'}</td>
                <td>
                  {order.items.map((item) => (
                    <div key={item._id || item.product}>
                      {item.name} x{item.quantity}
                    </div>
                  ))}
                </td>
                <td>${order.totalAmount.toFixed(2)}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      color: '#fff',
                      backgroundColor: statusColors[order.status] || '#888',
                    }}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="action-buttons">{renderActions(order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {orders.length === 0 && !loading && <p>No orders found.</p>}

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

export default AdminOrders;

