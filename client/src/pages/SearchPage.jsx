import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const retailerParam = searchParams.get('retailer') || 'all';

  const [inputValue, setInputValue] = useState(queryParam);
  const [products, setProducts] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [status, setStatus] = useState('idle'); // idle | loading | success | empty | error
  const [sortBy, setSortBy] = useState('relevance'); // relevance | price_asc | price_desc
  const [retailer, setRetailer] = useState(retailerParam);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  const runSearch = useCallback(async (q, cat, ret) => {
    setStatus('loading');
    setShowSuggestions(false);
    try {
      const data = await api.searchProducts({
        q,
        category: cat || undefined,
        retailer: ret && ret !== 'all' ? ret : undefined,
      });
      const results = data?.products || [];
      const alts = data?.alternatives || [];
      setProducts(results);
      setAlternatives(alts);
      setStatus(results.length === 0 && alts.length === 0 ? 'empty' : 'success');
    } catch (_) {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    setInputValue(queryParam);
    setRetailer(retailerParam);
    runSearch(queryParam, categoryParam, retailerParam);
  }, [queryParam, categoryParam, retailerParam, runSearch]);

  // Debounced search autocomplete
  useEffect(() => {
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getProductAutocomplete(inputValue.trim());
        if (res?.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch (_) {
        setSuggestions([]);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    setShowSuggestions(false);
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (categoryParam) newParams.category = categoryParam;
    if (retailer !== 'all') newParams.retailer = retailer;
    setSearchParams(newParams);
  }

  function handleSelectSuggestion(suggestion) {
    setInputValue(suggestion.title);
    setShowSuggestions(false);
    const newParams = {};
    newParams.q = suggestion.title;
    if (categoryParam) newParams.category = categoryParam;
    if (retailer !== 'all') newParams.retailer = retailer;
    setSearchParams(newParams);
  }

  function handleCategoryChange(newCat) {
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (newCat && newCat !== 'all') newParams.category = newCat;
    if (retailer !== 'all') newParams.retailer = retailer;
    setSearchParams(newParams);
  }

  function handleRetailerChange(newRet) {
    setRetailer(newRet);
    const newParams = {};
    if (inputValue.trim()) newParams.q = inputValue.trim();
    if (categoryParam) newParams.category = categoryParam;
    if (newRet !== 'all') newParams.retailer = newRet;
    setSearchParams(newParams);
  }

  // Filter and sort products on client
  let displayedProducts = [...products];

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
    { id: 'wearables', label: 'Wearables' },
    { id: 'electronics', label: 'Electronics' },
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
          <p className="text-muted mb-0">Live multi-store comparison across Amazon India, Flipkart, Meesho & eBay.</p>
        </div>

        {/* Large Search Box with Autocomplete Dropdown */}
        <div className="position-relative mb-4" ref={searchBoxRef}>
          <form onSubmit={handleSubmit}>
            <div className="search-hero-box shadow-sm">
              <div className="ps-2 text-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="What are you looking for? (e.g. Sony WH-1000XM5, iPhone, MacBook)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                aria-label="Search products"
                autoComplete="off"
              />
              <button type="submit" className="btn-lime px-4 py-2 border-0">
                <span>Search</span>
                <span>→</span>
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown Menu */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              className="position-absolute w-100 bg-white rounded-3 shadow-lg border mt-1 z-3 overflow-hidden"
              style={{ borderColor: 'var(--pr-border)' }}
            >
              <div className="p-2 border-bottom bg-light text-muted small fw-semibold">
                Suggested products
              </div>
              <ul className="list-unstyled mb-0">
                {suggestions.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="w-100 text-start px-3 py-2.5 border-0 bg-transparent d-flex align-items-center justify-content-between hover-bg-light"
                      onClick={() => handleSelectSuggestion(item)}
                      style={{ cursor: 'pointer', transition: 'background-color 0.15s ease' }}
                    >
                      <div className="d-flex align-items-center gap-2 text-truncate pe-2">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                          />
                        )}
                        <div>
                          <div className="text-dark small fw-medium text-truncate" style={{ maxWidth: '420px' }}>
                            {item.title}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {[item.brand, item.category].filter(Boolean).join(' · ')}
                          </div>
                        </div>
                      </div>
                      {item.minPriceInPaise && (
                        <span className="badge rounded-pill pr-badge-live px-2 py-1" style={{ fontSize: '0.75rem' }}>
                          ₹{(item.minPriceInPaise / 100).toLocaleString('en-IN')}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

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

          {/* Active Retailer / Product Source Selector */}
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted fw-medium d-none d-sm-inline">Source:</span>
            <select
              className="form-select form-select-sm"
              value={retailer}
              onChange={(e) => handleRetailerChange(e.target.value)}
              style={{ width: 'auto', borderRadius: 'var(--pr-radius-md)', fontWeight: 500 }}
              aria-label="Filter by retailer or product source"
            >
              <option value="all">All Sources (Amazon, Flipkart, Meesho, eBay)</option>
              <option value="amazon">Amazon India</option>
              <option value="flipkart">Flipkart</option>
              <option value="meesho">Meesho</option>
              <option value="ebay">eBay Marketplace</option>
            </select>
          </div>
        </div>

        {/* Results Metadata Bar: Count on Left, Sort on Right */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="small text-muted font-monospace">
            {status === 'loading'
              ? 'Searching verified databases…'
              : `${displayedProducts.length} ${displayedProducts.length === 1 ? 'product' : 'products'} found`}
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted d-none d-sm-inline">Sort by:</span>
            <select
              className="form-select form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: 'auto', borderRadius: 'var(--pr-radius-md)' }}
              aria-label="Sort products"
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
          /* When 0 exact products are found */
          <div>
            {alternatives.length > 0 ? (
              <div>
                <div
                  className="p-4 rounded-4 mb-4"
                  style={{
                    backgroundColor: 'var(--pr-mint-bg)',
                    border: '1px solid #C8DEC3',
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span style={{ fontSize: '1.25rem' }}>💡</span>
                    <h2 className="h6 fw-bold mb-0" style={{ color: 'var(--pr-forest)' }}>
                      No exact matches for &ldquo;{inputValue}&rdquo;
                    </h2>
                  </div>
                  <p className="text-muted small mb-0">
                    We couldn&apos;t find an exact product listing matching your search, but here are similar popular products you might like:
                  </p>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  {alternatives.map((product) => (
                    <div key={product.id} className="col">
                      <ProductCard
                        product={product}
                        onOpen={() => navigate(`/products/${product.id}`)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
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
            )}
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
