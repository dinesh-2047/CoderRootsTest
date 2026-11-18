import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const Products = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Update "now" every second for countdown timers
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/products', { params });
      const data = res.data?.data || res.data;
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            stock: product.stock,
          },
        ];
      }
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const formatCountdown = (ms) => {
    if (ms <= 0) return null;
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div>
      <h2>Products</h2>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => {
            const saleStart = new Date(product.saleStartTime).getTime();
            const timeUntilSale = saleStart - now;
            const saleNotStarted = timeUntilSale > 0;
            const outOfStock = product.stock === 0;
            const inCart = cart.find((item) => item.productId === product._id);
            const cartQty = inCart ? inCart.quantity : 0;
            const canAdd = !saleNotStarted && !outOfStock && cartQty < product.stock;

            return (
              <div key={product._id} className="product-card">
                <h3>{product.name}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
                <p>Stock: {product.stock}</p>
                {saleNotStarted ? (
                  <p className="countdown">
                    Sale starts in: {formatCountdown(timeUntilSale)}
                  </p>
                ) : outOfStock ? (
                  <p className="out-of-stock">Out of Stock</p>
                ) : (
                  <button
                    className="btn"
                    disabled={!canAdd}
                    onClick={() => addToCart(product)}
                  >
                    {cartQty > 0 ? `In Cart (${cartQty})` : 'Add to Cart'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {products.length === 0 && !loading && <p>No products found.</p>}

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

export default Products;

