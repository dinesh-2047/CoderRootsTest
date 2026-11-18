import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [saleStartTime, setSaleStartTime] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    try {
      await api.post('/products', {
        name,
        price: Number(price),
        stock: Number(stock),
        saleStartTime: new Date(saleStartTime).toISOString(),
      });
      setFormSuccess('Product added successfully!');
      setName('');
      setPrice('');
      setStock('');
      setSaleStartTime('');
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add product');
    }
  };

  return (
    <div>
      <h2>Manage Products</h2>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <h3>Add New Product</h3>
        {formError && <p className="error-msg">{formError}</p>}
        {formSuccess && <p className="success-msg">{formSuccess}</p>}
        <form onSubmit={handleAddProduct}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Stock</label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Sale Start Time</label>
            <input
              type="datetime-local"
              value={saleStartTime}
              onChange={(e) => setSaleStartTime(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn">Add Product</button>
        </form>
      </div>

      <h3>Product List</h3>
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
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sale Start</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>{new Date(product.saleStartTime).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export default AdminProducts;

