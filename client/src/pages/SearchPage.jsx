import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const [inputValue, setInputValue] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | empty | error
  const [lastQuery, setLastQuery] = useState(initialQuery);

  const runSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setStatus('loading');
    setLastQuery(q);
    try {
      const data = await api.searchProducts(q);
      const results = data?.products || [];
      setProducts(results);
      setStatus(results.length === 0 ? 'empty' : 'success');
    } catch (err) {
      setStatus('error');
    }
  }, []);

  // Run the search whenever the URL's ?q= changes (covers back/forward nav too).
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery, runSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    setSearchParams({ q: inputValue });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="search-input" className="visually-hidden">
          Search for a product, brand, or model
        </label>
        <div className="input-group">
          <input
            id="search-input"
            type="text"
            className="form-control"
            placeholder="Search for a product, brand, or model"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      {status === 'loading' && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Searching…</span>
          </div>
        </div>
      )}

      {status === 'empty' && (
        <p className="text-muted">
          No products matched &lsquo;{lastQuery}&rsquo;. Try a different search.
        </p>
      )}

      {status === 'error' && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>Something went wrong searching — try again.</span>
          <button className="btn btn-outline-danger btn-sm" onClick={() => runSearch(lastQuery)}>
            Retry
          </button>
        </div>
      )}

      {status === 'success' && (
        <ul className="list-unstyled d-flex flex-column gap-3" aria-label="Search results">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard
                product={product}
                onOpen={() => navigate(`/products/${product.id}`)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
