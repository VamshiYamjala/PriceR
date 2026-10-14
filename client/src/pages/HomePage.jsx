import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCategories()
      .then((data) => {
        if (data?.categories) {
          setCategories(data.categories.slice(0, 8));
        }
      })
      .catch(() => {
        setCategories(['smartphones', 'audio', 'wearables', 'laptops', 'beauty']);
      });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const popularSearches = [
    { label: 'Samsung M14', q: 'Samsung' },
    { label: 'boAt Airdopes', q: 'boAt' },
    { label: 'Sony WH-1000XM5', q: 'Sony' },
    { label: 'Noise ColorFit', q: 'Noise' },
    { label: 'Laptops', q: 'laptop' },
    { label: 'Beauty Catalog', q: 'mascara' },
  ];

  return (
    <div className="py-4">
      {/* Hero Section */}
      <div className="text-center py-5 px-3 mb-4 rounded-4" style={{ background: 'linear-gradient(180deg, #E8F5F1 0%, #F8F9FA 100%)' }}>
        <div className="row justify-content-center">
          <div className="col-lg-9 col-xl-8">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
              ⚡ Multi-Provider Price Intelligence & Monitoring
            </span>
            <h1 className="display-5 fw-bold mb-3" style={{ color: '#0F6E56' }}>
              Shop Smarter with PriceRadar
            </h1>
            <p className="lead text-muted mb-4">
              Search products across multiple online stores, compare verified prices with complete data transparency, and configure automated drop alerts.
            </p>

            <form onSubmit={handleSubmit} className="mb-4">
              <div className="input-group input-group-lg shadow-sm border rounded-pill overflow-hidden bg-white p-1">
                <span className="input-group-text bg-transparent border-0 ps-3 text-muted">
                  🔍
                </span>
                <input
                  type="text"
                  className="form-control border-0 shadow-none px-2"
                  placeholder="Search products, brands, or models (e.g., Sony, Samsung, boAt, perfume)..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button className="btn btn-primary rounded-pill px-4" type="submit">
                  Search Deals
                </button>
              </div>
            </form>

            <div className="d-flex flex-wrap justify-content-center align-items-center gap-2 small text-muted">
              <span className="fw-semibold">Popular:</span>
              {popularSearches.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill py-0 px-2"
                  onClick={() => navigate(`/search?q=${encodeURIComponent(item.q)}`)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Discovery */}
      {categories.length > 0 && (
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 fw-bold mb-0">Browse by Category</h2>
            <Link to="/search" className="small text-muted">
              View all products →
            </Link>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="btn btn-light border rounded-pill px-3 py-2 text-capitalize small fw-medium"
                onClick={() => navigate(`/search?category=${encodeURIComponent(cat)}`)}
              >
                {cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Transparency & Architecture Overview Card */}
      <div className="card shadow-sm mb-5 border-0" style={{ background: '#F1F3F5' }}>
        <div className="card-body p-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-secondary-subtle text-secondary border">Data Transparency Commitment</span>
                <span className="badge bg-info-subtle text-info border">Zero-Budget Architecture</span>
              </div>
              <h3 className="h5 fw-bold mb-2">Honest Data Labelling & Multi-Provider Architecture</h3>
              <p className="text-muted small mb-0">
                PriceRadar clearly distinguishes between <strong>Sample/Catalog Data</strong> (used for free discovery and predictable demonstration testing via DummyJSON &amp; fixtures) and <strong>Verified Live Retailer Offers</strong>. We never advertise artificial market savings or trigger false price-drop alerts from sample records.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/search?q=" className="btn btn-outline-dark btn-sm">
                Explore Full Catalog ↗
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card h-100 p-3 border">
            <div className="card-body">
              <div className="fs-3 mb-2">📊</div>
              <h4 className="h6 fw-bold">Multi-Source Comparison</h4>
              <p className="text-muted small mb-0">
                Compare side-by-side offers with verified lowest-price detection and accurate paise calculations.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-3 border">
            <div className="card-body">
              <div className="fs-3 mb-2">🔔</div>
              <h4 className="h6 fw-bold">Smart Price-Drop Alerts</h4>
              <p className="text-muted small mb-0">
                Set target price thresholds or fixed rupee drops. Receive notifications via Brevo email and Telegram.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 p-3 border">
            <div className="card-body">
              <div className="fs-3 mb-2">🛡️</div>
              <h4 className="h6 fw-bold">Scheduled Monitoring</h4>
              <p className="text-muted small mb-0">
                Automated background cycles track price observations with automatic alert re-arming and deduplication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
