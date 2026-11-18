import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (!analytics) return <p>Failed to load analytics.</p>;

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div className="analytics-card">
        <h3>Total Revenue</h3>
        <p className="revenue">${(analytics.totalRevenue || 0).toFixed(2)}</p>
      </div>

      <h3>Top 3 Products</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Total Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {(analytics.topProducts || []).map((p, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{p.name || p._id}</td>
              <td>{p.totalSold || p.totalQuantity || 0}</td>
              <td>${(p.totalRevenue || p.revenue || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Orders by Status</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Status</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {(analytics.ordersByStatus || []).map((s, idx) => (
            <tr key={idx}>
              <td>{s._id || s.status}</td>
              <td>{s.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;

