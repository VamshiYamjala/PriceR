import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatProviderName(offer) {
  if (!offer) return 'Retailer';
  const provider = typeof offer === 'string' ? offer : offer.provider;
  if (!provider) return 'Retailer';

  if (provider === 'apify') {
    const extId = (typeof offer === 'object' ? offer.externalProductId || '' : '').toLowerCase();
    const url = (typeof offer === 'object' ? offer.productUrl || '' : '').toLowerCase();
    if (extId.startsWith('amazon') || url.includes('amazon')) return 'Amazon India (Live)';
    if (extId.startsWith('flipkart') || url.includes('flipkart')) return 'Flipkart (Live)';
    if (extId.startsWith('meesho') || url.includes('meesho')) return 'Meesho (Live)';
    return 'Apify Live Retailer';
  }

  const map = {
    amazon: 'Amazon India',
    flipkart: 'Flipkart',
    dummyjson: 'DummyJSON Catalog',
    mockshop: 'mock.shop Storefront',
    ebay: 'eBay Marketplace',
    fixture: 'Fixture Dataset',
    scrapling: 'Scrapling Worker',
  };
  return map[provider.toLowerCase()] || provider;
}

export default function OfferRow({ offer, isLowest }) {
  const { isAuthenticated } = useAuth();
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  const priceInRupees = (offer.priceInPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  const isTrackedOffer = Boolean(offer.id || offer._id);

  async function handleAddToWatchlist(e) {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setAddingToWatchlist(true);
    setWatchlistStatus(null);
    try {
      await api.addToWatchlist(offer.id || offer._id);
      setWatchlistStatus('Added to Watchlist!');
    } catch (err) {
      if (err.response?.status === 409) {
        setWatchlistStatus('Already in Watchlist');
      } else {
        setWatchlistStatus('Failed to add');
      }
    } finally {
      setAddingToWatchlist(false);
    }
  }

  const isSample = offer.isSample || offer.dataStatus === 'sample';

  return (
    <div
      className="card-pr p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="fw-semibold text-dark small">
            {formatProviderName(offer)}
          </span>
          {isSample ? (
            <span className="badge-sample-tag">Sample Data</span>
          ) : (
            <span className="badge-live-tag">● Live Retailer</span>
          )}
          {isLowest && (
            <span
              className="badge px-2 py-1"
              style={{ backgroundColor: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', border: '1px solid #C8DEC3', fontSize: '0.75rem' }}
            >
              Lowest Price
            </span>
          )}
        </div>

        <div className="d-flex align-items-baseline gap-2">
          <span
            className="fw-bold"
            style={{ fontSize: '1.35rem', color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}
          >
            {priceInRupees}
          </span>
          {offer.originalPrice && offer.originalCurrency && offer.originalCurrency !== 'INR' && (
            <span className="small text-muted">
              (Orig: {offer.originalCurrency} {offer.originalPrice})
            </span>
          )}
        </div>

        <div className="d-flex gap-2 align-items-center mt-1">
          {offer.availability === 'out_of_stock' && (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
              Out of stock
            </span>
          )}
          {watchlistStatus && (
            <span className="small text-success fw-semibold">{watchlistStatus}</span>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center">
        {isTrackedOffer ? (
          isAuthenticated && (
            <>
              <button
                type="button"
                className="btn-outline-forest btn-sm"
                onClick={handleAddToWatchlist}
                disabled={addingToWatchlist}
                title="Save offer to personal watchlist"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{addingToWatchlist ? 'Adding…' : 'Watchlist'}</span>
              </button>
              <Link
                to={`/alerts/new?offerId=${offer.id || offer._id}`}
                className="btn-outline-forest btn-sm"
                title="Create a price-drop alert"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span>Set Alert</span>
              </Link>
            </>
          )
        ) : (
          <span className="small text-muted py-1 px-2 border rounded bg-light">
            Catalog Discovery
          </span>
        )}

        {offer.productUrl && (
          <a
            href={offer.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-forest btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span>View on {formatProviderName(offer).split(' ')[0]}</span>
            <span>↗</span>
          </a>
        )}
      </div>
    </div>
  );
}
