import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const providerParam = searchParams.get('provider') || 'all';
  const retailerParam = searchParams.get('retailer') || 'amazon';

  const [inputValue, setInputValue] = useState(queryParam);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | empty | error
  const [sortBy, setSortBy] = useState('relevance'); // relevance | price_asc | price_desc
  const [dataFilter, setDataFilter] = useState(providerParam); // all | live | sample
  const [retailer, setRetailer] = useState(retailerParam);

  // Load category list on mount
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res?.categories) setCategories(res.categories);
      })
      .catch(() => {});
  }, []);

  const runSearch = useCallback(async (q, cat, prov, ret) => {
    setStatus('loading');
    try {
      const data = await api.searchProducts({
        q,
        category: cat || undefined,
        provider: prov !== 'all' ? prov : undefined,
        retailer: prov === 'live' ? ret : undefined,
      });
      const results = data?.products || [];
      setProducts(results);
      setStatus(results.length === 0 ? 'empty' : 'success');
    } catch (err) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    setInputValue(queryParam);
    setDataFilter(providerParam);
    setRetailer(retailerParam);
    runSearch(queryParam, categoryParam, providerParam, retailerParam);
  }, [queryParam, categoryParam, providerParam, retailerParam, runSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (categoryParam) newParams.category = categoryParam;
    if (dataFilter !== 'all') newParams.provider = dataFilter;
    if (dataFilter === 'live') newParams.retailer = retailer;
    setSearchParams(newParams);
  }

  function handleCategoryChange(newCat) {
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (newCat && newCat !== 'all') newParams.category = newCat;
    if (dataFilter !== 'all') newParams.provider = dataFilter;
    if (dataFilter === 'live') newParams.retailer = retailer;
    setSearchParams(newParams);
  }

  function handleFilterChange(filter) {
    setDataFilter(filter);
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (categoryParam) newParams.category = categoryParam;
    if (filter !== 'all') newParams.provider = filter;
    if (filter === 'live') newParams.retailer = retailer;
    setSearchParams(newParams);
  }

  function handleRetailerChange(newRet) {
    setRetailer(newRet);
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (categoryParam) newParams.category = categoryParam;
    if (dataFilter !== 'all') newParams.provider = dataFilter;
    newParams.retailer = newRet;
    setSearchParams(newParams);
  }

  // Filter and sort products on client
  let displayedProducts = [...products];

  if (dataFilter === 'live') {
    displayedProducts = displayedProducts.filter(
      (p) => p.dataStatus === 'live' && !p.isSample
    );
  } else if (dataFilter === 'sample') {
    displayedProducts = displayedProducts.filter(
      (p) => p.dataStatus === 'sample' || p.isSample
    );
  }

  if (sortBy === 'price_asc') {
    displayedProducts.sort((a, b) => {
      const minA = a.offers?.length ? Math.min(...a.offers.map((o) => o.priceInPaise)) : Infinity;
      const minB = b.offers?.length ? Math.min(...b.offers.map((o) => o.priceInPaise)) : Infinity;
      return minA - minB;
    });
  } else if (sortBy === 'price_desc') {
    displayedProducts.sort((a, b) => {
      const maxA = a.offers?.length ? Math.max(...a.offers.map((o) => o.priceInPaise)) : -Infinity;
      const maxB = b.offers?.length ? Math.max(...b.offers.map((o) => o.priceInPaise)) : -Infinity;
      return maxB - maxA;
    });
  }

  return (
    <div className="py-3">
      {/* Search Header */}
      <div className="card shadow-sm mb-4 border-0 bg-white p-3">
        <form onSubmit={handleSubmit} className="mb-3">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">🔍</span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by product title, brand, or model..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button type="submit" className="btn btn-primary px-4">
              Search
            </button>
          </div>
        </form>

        {/* Filters and Controls */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="small text-muted fw-semibold">Source:</span>
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${dataFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleFilterChange('all')}
              >
                All Sources
              </button>
              <button
                type="button"
                className={`btn ${dataFilter === 'sample' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleFilterChange('sample')}
              >
                Sample Catalogs
              </button>
              <button
                type="button"
                className={`btn ${dataFilter === 'live' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => handleFilterChange('live')}
              >
                ● Verified Live (Apify)
              </button>
            </div>

            {dataFilter === 'live' && (
              <select
                className="form-select form-select-sm w-auto"
                value={retailer}
                onChange={(e) => handleRetailerChange(e.target.value)}
                title="Select live retail marketplace"
              >
                <option value="amazon">Amazon India</option>
                <option value="flipkart">Flipkart</option>
                <option value="meesho">Meesho</option>
              </select>
            )}

            {categories.length > 0 && (
              <select
                className="form-select form-select-sm w-auto"
                value={categoryParam || 'all'}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-semibold">Sort by:</span>
            <select
              className="form-select form-select-sm w-auto"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {status === 'loading' && (
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="card p-3">
              <div className="d-flex gap-3 align-items-center">
                <div className="skeleton-box" style={{ width: '80px', height: '80px', borderRadius: '8px' }}></div>
                <div className="flex-grow-1">
                  <div className="skeleton-box mb-2" style={{ width: '60%', height: '20px' }}></div>
                  <div className="skeleton-box mb-3" style={{ width: '40%', height: '14px' }}></div>
                  <div className="skeleton-box" style={{ width: '80%', height: '36px' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {status === 'empty' && (
        <div className="card text-center p-5 border-0 shadow-sm bg-white">
          <div className="fs-1 mb-2">🔎</div>
          <h3 className="h5 fw-bold">No matching products found</h3>
          <p className="text-muted small mb-3">
            We couldn&apos;t find any products matching your query and active filters.
          </p>
          {dataFilter === 'live' && (
            <div className="alert alert-light border small text-start mx-auto mb-3" style={{ maxWidth: '520px' }}>
              <div className="fw-semibold text-primary mb-1">ℹ️ Live Retailer Search (Apify)</div>
              <div>Live search requires <code>APIFY_API_TOKEN</code> configured in <code>server/.env</code>. If unconfigured or the retailer returns no results, switch to <strong>All Sources</strong> or <strong>Sample Catalogs</strong> to explore demonstration products.</div>
            </div>
          )}
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearchParams({ q: 'Samsung' });
              }}
            >
              Try &quot;Samsung&quot;
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearchParams({ q: 'Sony' });
              }}
            >
              Try &quot;Sony&quot;
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearchParams({ q: 'boAt' });
              }}
            >
              Try &quot;boAt&quot;
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center shadow-sm">
          <span>Failed to load search results. Please verify connection and try again.</span>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => runSearch(queryParam, categoryParam, providerParam)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Results List */}
      {status === 'success' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="small text-muted fw-semibold">
              Showing {displayedProducts.length} product(s)
              {queryParam ? ` for "${queryParam}"` : ''}
              {categoryParam ? ` in ${categoryParam}` : ''}
            </span>
          </div>

          <ul className="list-unstyled d-flex flex-column gap-3 mb-4" aria-label="Search results">
            {displayedProducts.map((product) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  onOpen={() => navigate(`/products/${product.id}`)}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
