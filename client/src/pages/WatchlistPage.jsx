import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternalSidebar from '../components/InternalSidebar';

export default function WatchlistPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    async function loadWatchlist() {
      try {
        const data = await api.getWatchlist();
        setItems(data?.items || []);
      } catch (err) {
        console.error('Failed to load watchlist:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlist();
  }, [isAuthenticated]);

  async function handleRemove(id) {
    try {
      await api.removeFromWatchlist(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }

  return (
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <span className="pr-section-eyebrow d-block mb-1">YOUR PRICERADAR</span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
            Watchlist
          </h1>
          <p className="text-muted small mb-0">Tracked items and price comparison monitors.</p>
        </div>
        <div>
          <Link to="/search" className="btn btn-pr-primary btn-sm px-3 py-2">
            + Add Products
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Account Sidebar Navigation */}
        <div className="col-12 col-lg-3">
          <InternalSidebar />
        </div>

        {/* Main Content Area */}
        <div className="col-12 col-lg-9">
          {!isAuthenticated ? (
            <div
              className="p-5 text-center rounded-4 bg-white"
              style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '64px', height: '64px', background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                Sign in to view your watchlist
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                Your saved products, price alert setups, and historical changes are synchronized across your devices.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <Link to="/login" className="btn btn-pr-primary px-4 py-2">
                  Log in to your account →
                </Link>
                <Link to="/register" className="btn btn-pr-outline-forest px-4 py-2">
                  Create account
                </Link>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--pr-forest)' }} role="status">
                <span className="visually-hidden">Loading watchlist…</span>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div
              className="p-5 text-center rounded-4 bg-white"
              style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '64px', height: '64px', background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                Your watchlist is currently empty
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                Save products from search or product detail pages to monitor price shifts, store differences, and active offers.
              </p>
              <Link to="/search" className="btn btn-pr-primary px-4 py-2">
                Explore products →
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {items.map((item) => {
                const offer = item.offer || {};
                const price = ((offer.priceInPaise || 0) / 100).toLocaleString('en-IN');
                const offerId = offer.id || offer._id || item.offerId;
                return (
                  <div
                    key={item.id}
                    className="p-3 p-md-4 rounded-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <div className="d-flex align-items-center gap-3 min-w-0 flex-grow-1">
                      {offer.imageUrl ? (
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center p-2 flex-shrink-0"
                          style={{ width: '70px', height: '70px', background: 'var(--pr-image-bg)' }}
                        >
                          <img
                            src={offer.imageUrl}
                            alt={offer.title || 'Product'}
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div
                          className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{ width: '70px', height: '70px', background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
                        >
                          🛍️
                        </div>
                      )}
                      <div className="min-w-0 flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                          {offer.provider && (
                            <span
                              className="badge text-uppercase tracking-wider fw-semibold px-2 py-0.5 rounded-pill"
                              style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.7rem' }}
                            >
                              {offer.provider}
                            </span>
                          )}
                          {offer.availability && (
                            <span className="badge rounded-pill pr-badge-live px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                              {offer.availability.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <h2 className="h6 fw-bold mb-1 text-truncate" style={{ color: 'var(--pr-text-dark)' }}>
                          {offer.title || 'Tracked Product Offer'}
                        </h2>
                        <div className="fs-5 fw-bold" style={{ color: 'var(--pr-forest)' }}>
                          ₹{price}
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 align-self-end align-self-md-center flex-shrink-0">
                      {offerId && (
                        <Link
                          to={`/alerts/new?offerId=${offerId}`}
                          className="btn btn-pr-primary btn-sm px-3 py-1.5"
                        >
                          Set alert
                        </Link>
                      )}
                      <button
                        type="button"
                        className="btn btn-link text-danger text-decoration-none small px-2 py-1"
                        onClick={() => handleRemove(item.id)}
                        title="Remove from watchlist"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
