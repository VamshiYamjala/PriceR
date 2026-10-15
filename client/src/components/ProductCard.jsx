import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function ProductCard({ product, onOpen }) {
  const { isAuthenticated } = useAuth();
  const { title, brand, model, category, imageUrl, dataStatus, offers = [] } = product;

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const isSample = dataStatus === 'sample' || product.isSample;

  // Compute lowest active price
  const validOffers = offers.filter((o) => o.availability !== 'out_of_stock' && o.lastStatus !== 'error');
  const lowestOffer = validOffers.length > 0
    ? validOffers.reduce((min, o) => (o.priceInPaise < min.priceInPaise ? o : min))
    : offers[0] || null;

  const displayPrice = lowestOffer?.priceInPaise
    ? `₹${(lowestOffer.priceInPaise / 100).toLocaleString('en-IN')}`
    : 'Check price';

  async function handleToggleWatchlist(e) {
    e.stopPropagation();
    if (!isAuthenticated || !lowestOffer?.id) return;
    setWatchlistLoading(true);
    try {
      await api.addToWatchlist(lowestOffer.id);
      setInWatchlist(true);
    } catch (_) {
      // If conflict or error, keep graceful state
    } finally {
      setWatchlistLoading(false);
    }
  }

  return (
    <div
      className="card-pr h-100 d-flex flex-column text-start position-relative"
      style={{ cursor: 'pointer' }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen?.();
        }
      }}
      aria-label={`View details for ${title}`}
    >
      {/* Product Image Area with Light Cool Gray Background */}
      <div
        className="product-image-container"
        style={{ height: '210px', backgroundColor: 'var(--pr-image-bg)' }}
      >
        {/* Sample / Live Provenance Tag */}
        <div className="position-absolute top-0 start-0 m-3 z-1">
          {isSample ? (
            <span className="badge-sample-tag">Sample product</span>
          ) : (
            <span className="badge-live-tag">● Live Retailer</span>
          )}
        </div>

        {/* Watchlist Heart Button */}
        {isAuthenticated && lowestOffer?.id && (
          <button
            type="button"
            className={`wishlist-btn-heart ${inWatchlist ? 'active' : ''}`}
            onClick={handleToggleWatchlist}
            disabled={watchlistLoading}
            title={inWatchlist ? 'Saved in Watchlist' : 'Save to Watchlist'}
            aria-label="Add to watchlist"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={inWatchlist ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        )}

        {/* Product Image */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="text-muted d-flex flex-column align-items-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
        )}
      </div>

      {/* Card Content Area */}
      <div className="p-3 d-flex flex-column flex-grow-1 justify-content-between">
        <div>
          {/* Category */}
          <div className="small text-capitalize mb-1" style={{ color: 'var(--pr-text-muted)', fontSize: '0.8rem' }}>
            {category || brand || 'Electronics'}
          </div>

          {/* Title */}
          <h3
            className="fw-bold mb-1"
            style={{
              fontSize: '1rem',
              color: 'var(--pr-text-dark)',
              lineHeight: '1.35',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7em',
            }}
          >
            {title}
          </h3>

          {/* Specs / Model line */}
          <p
            className="small mb-3"
            style={{
              color: 'var(--pr-text-muted)',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {[brand, model].filter(Boolean).join(' · ') || (offers.length > 1 ? `${offers.length} retailer stores` : 'Verified product')}
          </p>
        </div>

        {/* Divider & Pricing Footer */}
        <div className="pt-2 border-top" style={{ borderColor: 'var(--pr-border)' }}>
          <div className="d-flex align-items-end justify-content-between">
            <div>
              <span
                className="d-block text-uppercase"
                style={{ fontSize: '0.7rem', color: 'var(--pr-text-muted)', letterSpacing: '0.04em' }}
              >
                {isSample ? 'Sample price' : 'Best price'}
              </span>
              <span
                className="fw-bold"
                style={{ fontSize: '1.25rem', color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}
              >
                {displayPrice}
              </span>
            </div>

            {/* Circular Lime Arrow Button */}
            <div
              className="btn-lime-circle"
              aria-label="View product details"
              title="View product details"
            >
              →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
