import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

function formatProviderName(provider) {
  if (!provider) return 'Retailer';
  const map = {
    amazon: 'Amazon India',
    flipkart: 'Flipkart',
    dummyjson: 'DummyJSON Catalog',
    mockshop: 'mock.shop Storefront',
    ebay: 'eBay Marketplace',
    fixture: 'Fixture Dataset',
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

  const isTrackedOffer =
    offer.id &&
    !offer.id.startsWith('dummyjson-') &&
    !offer.id.startsWith('mockshop-') &&
    !offer.id.startsWith('ebay-');

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
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border rounded p-3 gap-2 bg-white">
      <div>
        <div className="d-flex align-items-center gap-2 mb-1">
          <span className="fw-semibold text-secondary small">
            {formatProviderName(offer.provider)}
          </span>
          {isSample ? (
            <span className="badge badge-sample small" title="Simulated demonstration data">
              Sample Data
            </span>
          ) : (
            <span className="badge badge-live small" title="Verified live retailer offer">
              ● Live Retailer
            </span>
          )}
        </div>

        <div className="fs-5 fw-bold text-dark d-flex align-items-baseline gap-2">
          {priceInRupees}
          {isLowest && <span className="badge badge-lowest small">Lowest price</span>}
        </div>

        {offer.originalPrice && offer.originalCurrency && offer.originalCurrency !== 'INR' && (
          <div className="text-muted small">
            Converted from {offer.originalCurrency} {offer.originalPrice}
          </div>
        )}

        <div className="mt-1 d-flex gap-2 align-items-center">
          {offer.availability === 'out_of_stock' && (
            <span className="badge bg-danger-subtle text-danger">Out of stock</span>
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
                className="btn btn-outline-secondary btn-sm"
                onClick={handleAddToWatchlist}
                disabled={addingToWatchlist}
                title="Add to your personal price watchlist"
              >
                {addingToWatchlist ? 'Adding…' : '+ Watchlist'}
              </button>
              <Link
                to={`/alerts/new?offerId=${offer.id || offer._id}`}
                className="btn btn-outline-primary btn-sm"
                title="Configure smart price drop alert"
              >
                🔔 Set Alert
              </Link>
            </>
          )
        ) : (
          <span className="badge bg-light text-muted border small py-2 px-2">
            Catalog Discovery
          </span>
        )}

        {offer.productUrl && (
          <a
            href={offer.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            onClick={(e) => e.stopPropagation()}
          >
            View on {formatProviderName(offer.provider).split(' ')[0]} ↗
          </a>
        )}
      </div>
    </div>
  );
}
