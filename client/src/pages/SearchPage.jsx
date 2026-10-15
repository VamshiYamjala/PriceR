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
  const [status, setStatus] = useState('idle'); // idle | loading | success | empty | error
  const [sortBy, setSortBy] = useState('relevance'); // relevance | price_asc | price_desc
  const [dataFilter, setDataFilter] = useState(providerParam); // all | live | sample
  const [retailer, setRetailer] = useState(retailerParam);

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
    } catch (_) {
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
      const pA = Math.min(...(a.offers || []).map((o) => o.priceInPaise || Infinity));
      const pB = Math.min(...(b.offers || []).map((o) => o.priceInPaise || Infinity));
      return pA - pB;
    });
  } else if (sortBy === 'price_desc') {
    displayedProducts.sort((a, b) => {
      const pA = Math.max(...(a.offers || []).map((o) => o.priceInPaise || 0));
      const pB = Math.max(...(b.offers || []).map((o) => o.priceInPaise || 0));
      return pB - pA;
    });
  }

  const categories = [
    { id: 'all', label: 'All products' },
    { id: 'audio', label: 'Audio' },
    { id: 'laptops', label: 'Laptops' },
    { id: 'cameras', label: 'Cameras' },
    { id: 'smartphones', label: 'Smartphones' },
  ];

  return (
    <div className="py-4">
      <div className="container">
        {/* Page Header */}
        <div className="mb-4">
          <span className="eyebrow">FIND SOMETHING WORTH TRACKING</span>
          <h1 className="fw-bold tracking-tight mb-1" style={{ fontSize: '2.5rem' }}>
            Product search
          </h1>
          <p className="text-muted mb-0">Your next great purchase starts here.</p>
        </div>

        {/* Large Search Box */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="search-hero-box shadow-sm">
            <div className="ps-2 text-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="btn-lime px-4 py-2 border-0">
              <span>Search</span>
              <span>→</span>
            </button>
          </div>
        </form>

        {/* Category Filter Chips & Data Source Controls */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom" style={{ borderColor: 'var(--pr-border)' }}>
          {/* Categories */}
          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = (!categoryParam && cat.id === 'all') || categoryParam === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={`filter-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Provenance Selector (Live vs Sample vs All) */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm" role="group">
              <button
                type="button"
                className={`btn ${dataFilter === 'all' ? 'btn-forest' : 'btn-outline-forest'}`}
                onClick={() => handleFilterChange('all')}
              >
                All Sources
              </button>
              <button
                type="button"
                className={`btn ${dataFilter === 'live' ? 'btn-forest' : 'btn-outline-forest'}`}
                onClick={() => handleFilterChange('live')}
              >
                ● Live Retailers
              </button>
              <button
                type="button"
                className={`btn ${dataFilter === 'sample' ? 'btn-forest' : 'btn-outline-forest'}`}
                onClick={() => handleFilterChange('sample')}
              >
                Sample Catalog
              </button>
            </div>

            {dataFilter === 'live' && (
              <select
                className="form-select form-select-sm"
                value={retailer}
                onChange={(e) => handleRetailerChange(e.target.value)}
                style={{ width: 'auto', borderRadius: 'var(--pr-radius-md)' }}
              >
                <option value="amazon">Amazon India</option>
                <option value="flipkart">Flipkart</option>
                <option value="meesho">Meesho</option>
              </select>
            )}
          </div>
        </div>

        {/* Results Metadata Bar: Count on Left, Sort on Right */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="small text-muted font-monospace">
            {status === 'loading'
              ? 'Searching verified databases…'
              : `${displayedProducts.length} ${dataFilter === 'sample' ? 'sample products' : 'products found'}`}
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-none d-sm-inline">Sort by:</span>
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', borderRadius: 'var(--pr-radius-md)' }}
            >
              <option value="relevance">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Search Results Grid */}
        {status === 'loading' ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success mb-3" role="status" />
            <p className="text-muted small">Querying supported product providers...</p>
          </div>
        ) : status === 'error' ? (
          <div className="card-pr p-5 text-center my-4 bg-white">
            <h3 className="h5 fw-bold text-danger mb-2">Search request encountered an error</h3>
            <p className="text-muted small mb-3">Please try refining your search keywords or check network connectivity.</p>
            <button
              className="btn-forest btn-sm"
              onClick={() => runSearch(queryParam, categoryParam, dataFilter, retailer)}
            >
              Retry Search
            </button>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="card-pr p-5 text-center my-4 bg-white">
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: '56px', height: '56px', backgroundColor: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="h5 fw-bold mb-1">No products found</h3>
            <p className="text-muted small mb-3">
              We couldn&apos;t find any matching items for &ldquo;{inputValue}&rdquo;. Try another brand or generic keyword.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn-outline-forest btn-sm"
                onClick={() => {
                  setInputValue('');
                  setSearchParams({});
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {displayedProducts.map((product) => (
              <div key={product.id} className="col">
                <ProductCard
                  product={product}
                  onOpen={() => navigate(`/products/${product.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
