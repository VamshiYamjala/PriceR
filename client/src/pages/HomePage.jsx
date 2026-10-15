import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [discoveryProducts, setDiscoveryProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load a curated selection of products for the discovery section
    async function loadDiscovery() {
      try {
        const res = await api.searchProducts({ q: '', provider: 'all' });
        setDiscoveryProducts(res?.products || []);
      } catch (_) {
        setDiscoveryProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadDiscovery();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  }

  // Filter discovery items by category
  const filteredProducts = activeCategory === 'all'
    ? discoveryProducts.slice(0, 6)
    : discoveryProducts.filter(
        (p) =>
          (p.category || '').toLowerCase().includes(activeCategory.toLowerCase()) ||
          (p.title || '').toLowerCase().includes(activeCategory.toLowerCase())
      ).slice(0, 6);

  return (
    <div>
      {/* ------------------------------------------------------------------ */}
      {/* HERO SECTION                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-5" style={{ backgroundColor: 'var(--pr-bg-soft)' }}>
        <div className="container">
          <div className="row align-items-center g-5 py-lg-4">
            {/* Left Column: Headlines & Search */}
            <div className="col-lg-6">
              <span className="eyebrow mb-2">
                — BUY BETTER. NOT BIGGER.
              </span>

              <h1
                className="fw-bold tracking-tight mb-3"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  lineHeight: '1.05',
                  color: 'var(--pr-text-dark)',
                }}
              >
                PriceRadar<span style={{ color: 'var(--pr-forest)' }}>.</span>
              </h1>

              <h2
                className="fw-bold mb-3"
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 1.85rem)',
                  lineHeight: '1.25',
                  color: 'var(--pr-text-dark)',
                }}
              >
                Find the Best Price.<br />
                Track Every Drop.
              </h2>

              <p
                className="lead mb-4"
                style={{
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  color: 'var(--pr-text-muted)',
                  maxWidth: '480px',
                }}
              >
                A little research goes a long way. Discover your next favorite and find a price worth waiting for.
              </p>

              {/* Search Box */}
              <form onSubmit={handleSearchSubmit} className="mb-3" style={{ maxWidth: '500px' }}>
                <div className="search-hero-box">
                  <div className="ps-2 text-muted">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search products"
                  />
                  <button type="submit" className="btn-lime px-4 py-2 border-0">
                    <span>Search</span>
                    <span>→</span>
                  </button>
                </div>
              </form>

              {/* Quick Navigation Tags */}
              <div className="d-flex flex-wrap align-items-center gap-2 small" style={{ color: 'var(--pr-text-muted)' }}>
                <span>On your radar:</span>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-dark fw-medium small"
                  onClick={() => navigate('/search?q=headphones')}
                >
                  Headphones →
                </button>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-dark fw-medium small"
                  onClick={() => navigate('/search?q=laptop')}
                >
                  Laptops →
                </button>
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none text-dark fw-medium small"
                  onClick={() => navigate('/search?q=camera')}
                >
                  Cameras →
                </button>
              </div>
            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="col-lg-6">
              <div
                className="position-relative rounded-4 p-4 p-lg-5 overflow-hidden text-center"
                style={{
                  backgroundColor: 'var(--pr-surface-subtle)',
                  border: '1px solid var(--pr-border)',
                  minHeight: '380px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* Decorative Subtle Product Grouping Artwork */}
                <div className="w-100 position-relative py-3">
                  <div className="row g-3 align-items-center justify-content-center">
                    <div className="col-8">
                      <div className="bg-white rounded-3 p-4 shadow-sm border border-light text-start">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="badge-live-tag">● Live Price Radar</span>
                          <span className="small text-success fw-bold">-18% Drop</span>
                        </div>
                        <h4 className="h6 fw-bold mb-1 text-dark">Studio Wireless Headphones</h4>
                        <div className="d-flex justify-content-between align-items-baseline mt-3 pt-2 border-top">
                          <div>
                            <span className="small text-muted d-block" style={{ fontSize: '0.7rem' }}>Best Offer</span>
                            <span className="h5 fw-bold text-dark mb-0">₹24,999</span>
                          </div>
                          <span className="btn-lime-circle">→</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-7 offset-1">
                      <div className="bg-white rounded-3 p-3 shadow-sm border border-light text-start" style={{ transform: 'translateY(-12px)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="badge-sample-tag">Amazon &amp; Flipkart</span>
                          <span className="badge-armed small">Target Reached</span>
                        </div>
                        <p className="small mb-0 text-dark fw-semibold text-truncate">Galaxy Ultralight Display</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3-FEATURE GREEN STRIP (Dark Forest Green)                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="feature-strip-dark">
        <div className="container">
          <div className="row g-4 text-start">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '40px', height: '40px', backgroundColor: 'rgba(206, 235, 93, 0.15)', color: 'var(--pr-lime)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <div>
                  <h3 className="h6 fw-bold text-white mb-0">Compare prices</h3>
                  <p className="small mb-0" style={{ color: '#BAC7BE' }}>Look at the bigger picture</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '40px', height: '40px', backgroundColor: 'rgba(206, 235, 93, 0.15)', color: 'var(--pr-lime)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div>
                  <h3 className="h6 fw-bold text-white mb-0">Track price drops</h3>
                  <p className="small mb-0" style={{ color: '#BAC7BE' }}>Wait for your moment</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '40px', height: '40px', backgroundColor: 'rgba(206, 235, 93, 0.15)', color: 'var(--pr-lime)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h3 className="h6 fw-bold text-white mb-0">Shop with confidence</h3>
                  <p className="small mb-0" style={{ color: '#BAC7BE' }}>Less second-guessing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 01: THE DISCOVERY EDIT                                     */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-5" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="eyebrow">01 / THE DISCOVERY EDIT</span>
              <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>Worth a closer look.</h2>
              <p className="text-muted mb-0">Everyday essentials. A considered selection.</p>
            </div>
            <Link to="/search" className="fw-semibold small mt-3 mt-md-0 d-inline-flex align-items-center gap-1">
              <span>Explore all products</span>
              <span>→</span>
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-2 border-bottom">
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className={`filter-chip ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>All products</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${activeCategory === 'audio' ? 'active' : ''}`}
                onClick={() => setActiveCategory('audio')}
              >
                <span>Audio</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${activeCategory === 'laptop' ? 'active' : ''}`}
                onClick={() => setActiveCategory('laptop')}
              >
                <span>Laptops</span>
              </button>
              <button
                type="button"
                className={`filter-chip ${activeCategory === 'camera' ? 'active' : ''}`}
                onClick={() => setActiveCategory('camera')}
              >
                <span>Cameras</span>
              </button>
            </div>

            <div className="small text-muted d-flex align-items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Demo collection</span>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-3">
              <p className="text-muted mb-0">No discovery products available currently.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {filteredProducts.map((p) => (
                <div key={p.id} className="col">
                  <ProductCard product={p} onOpen={() => navigate(`/products/${p.id}`)} />
                </div>
              ))}
            </div>
          )}

          <p className="small text-muted text-center mt-4 mb-0" style={{ fontSize: '0.78rem' }}>
            ⓘ Sample products and example prices shown for demonstration. Search query triggers live multi-retailer evaluation.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 02: A LITTLE PERSPECTIVE (Pale Mint #EAF2E6)               */}
      {/* ------------------------------------------------------------------ */}
      <section className="section-mint">
        <div className="container">
          <div className="mb-5">
            <span className="eyebrow">02 / A LITTLE PERSPECTIVE</span>
            <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>Good decisions start here.</h2>
            <p className="text-muted mb-0">From your first search to your next purchase.</p>
          </div>

          <div className="row g-4">
            <div className="col-sm-6 col-lg-3">
              <div className="bg-white p-4 rounded-3 h-100 border shadow-sm">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '42px', height: '42px', backgroundColor: 'var(--pr-lime)', color: 'var(--pr-text-dark)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                  </svg>
                </div>
                <h3 className="h6 fw-bold mb-2">Compare with confidence</h3>
                <p className="small text-muted mb-0">
                  See available offers side by side and find the price that works for you.
                </p>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="bg-white p-4 rounded-3 h-100 border shadow-sm">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '42px', height: '42px', backgroundColor: 'var(--pr-lime)', color: 'var(--pr-text-dark)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <h3 className="h6 fw-bold mb-2">Keep your favorites close</h3>
                <p className="small text-muted mb-0">
                  Build a watchlist so the products you&apos;re considering are always in reach.
                </p>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="bg-white p-4 rounded-3 h-100 border shadow-sm">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '42px', height: '42px', backgroundColor: 'var(--pr-lime)', color: 'var(--pr-text-dark)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <h3 className="h6 fw-bold mb-2">Your price. Your alert.</h3>
                <p className="small text-muted mb-0">
                  Set a target price and get notified when an available offer reaches it.
                </p>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="bg-white p-4 rounded-3 h-100 border shadow-sm">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: '42px', height: '42px', backgroundColor: 'var(--pr-lime)', color: 'var(--pr-text-dark)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <h3 className="h6 fw-bold mb-2">See the bigger picture</h3>
                <p className="small text-muted mb-0">
                  Follow price history to put today&apos;s offer in true perspective.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 03: YOUR NEXT MOVE                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="py-5" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container py-4">
          <div className="mb-5">
            <span className="eyebrow">03 / YOUR NEXT MOVE</span>
            <h2 className="fw-bold mb-1" style={{ fontSize: '2rem' }}>From &ldquo;I want it&rdquo; to &ldquo;it&apos;s worth it.&rdquo;</h2>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-3">
                <div className="display-6 fw-bold text-dark mb-2 font-monospace" style={{ opacity: 0.85 }}>
                  01
                </div>
                <h3 className="h5 fw-bold mb-2 text-dark">Find your product</h3>
                <p className="small text-muted">
                  Search for something you have in mind, or discover verified products across supported retailers.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <div className="display-6 fw-bold text-dark mb-2 font-monospace" style={{ opacity: 0.85 }}>
                  02
                </div>
                <h3 className="h5 fw-bold mb-2 text-dark">Compare &amp; keep track</h3>
                <p className="small text-muted">
                  Check available prices and save products directly to your personal watchlist.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3">
                <div className="display-6 fw-bold text-dark mb-2 font-monospace" style={{ opacity: 0.85 }}>
                  03
                </div>
                <h3 className="h5 fw-bold mb-2 text-dark">Buy when it feels right</h3>
                <p className="small text-muted">
                  Set your target price. Let real-time email and Telegram alerts bring you back at the right time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* WIDE LIME CTA BANNER                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="banner-lime">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1" style={{ fontSize: '1.85rem', color: 'var(--pr-text-dark)' }}>
                Your next great find is out there.
              </h2>
              <p className="mb-0" style={{ color: 'var(--pr-forest)', fontWeight: 500 }}>
                Start with a search. Make a more informed choice.
              </p>
            </div>
            <Link to="/search" className="btn-forest px-4 py-3 flex-shrink-0">
              <span>Explore products</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
