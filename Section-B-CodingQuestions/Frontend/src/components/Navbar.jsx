import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Flash Sale Manager
      </Link>
      <div className="nav-links">
        <Link to="/">Products</Link>
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
        {user && user.role === 'customer' && (
          <>
            <Link to="/cart">Cart</Link>
            <Link to="/my-orders">My Orders</Link>
          </>
        )}
        {user && user.role === 'admin' && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/orders">Orders</Link>
            <Link to="/admin/products">Products</Link>
          </>
        )}
        {user && (
          <span className="nav-user">
            {user.fullName} ({user.role})
            <button className="btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

