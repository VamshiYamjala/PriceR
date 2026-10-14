import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  async function handleRemove(id) {
    try {
      await api.removeFromWatchlist(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">My Watchlist</h1>
        <Link to="/search" className="btn btn-outline-primary btn-sm">
          + Add More Products
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center p-5 shadow-sm">
          <p className="text-muted mb-3">Your watchlist is currently empty.</p>
          <div>
            <Link to="/search" className="btn btn-primary btn-sm">
              Explore Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {items.map((item) => (
            <div key={item.id} className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h6 mb-1">{item.offer?.title || 'Offer'}</h2>
                  <span className="badge bg-secondary-subtle text-secondary me-2">
                    {item.offer?.provider}
                  </span>
                  <span className="fw-bold">
                    ₹{((item.offer?.priceInPaise || 0) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <Link
                    to={`/alerts/new?offerId=${item.offer?.id || item.offer?._id}`}
                    className="btn btn-sm btn-outline-success"
                  >
                    Set Alert
                  </Link>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
