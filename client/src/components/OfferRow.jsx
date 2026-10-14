import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function OfferRow({ offer, isLowest }) {
  const { isAuthenticated } = useAuth();
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  const priceInRupees = (offer.priceInPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

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

  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border rounded p-3 gap-2">
      <div>
        <div className="text-capitalize fw-semibold text-secondary small">{offer.provider}</div>
        <div className="fs-5 fw-bold text-dark">
          {priceInRupees}
          {isLowest && <span className="badge text-bg-success ms-2">Lowest price</span>}
        </div>
        <div className="mt-1 d-flex gap-2 align-items-center">
          {offer.isSample && (
            <span className="badge bg-secondary-subtle text-secondary border">Sample data</span>
          )}
          {offer.availability === 'out_of_stock' && (
            <span className="badge bg-danger-subtle text-danger">Out of stock</span>
          )}
          {watchlistStatus && (
            <span className="small text-success fw-semibold">{watchlistStatus}</span>
          )}
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center">
        {isAuthenticated && (
          <>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleAddToWatchlist}
              disabled={addingToWatchlist}
            >
              {addingToWatchlist ? 'Adding…' : '+ Watchlist'}
            </button>
            <Link
              to={`/alerts/new?offerId=${offer.id || offer._id}`}
              className="btn btn-outline-primary btn-sm"
            >
              🔔 Set Alert
            </Link>
          </>
        )}
        <a
          href={offer.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary btn-sm"
          onClick={(e) => e.stopPropagation()}
        >
          View on {offer.provider} ↗
        </a>
      </div>
    </div>
  );
}
