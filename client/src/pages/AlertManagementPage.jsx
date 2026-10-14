import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

export default function AlertManagementPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await api.getAlerts();
        setAlerts(data?.alerts || []);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAlerts();
  }, []);

  async function handleDelete(id) {
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h4 mb-0">Manage Price Alerts</h1>
        <Link to="/watchlist" className="btn btn-outline-primary btn-sm">
          + New Alert from Watchlist
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="card text-center p-5 shadow-sm">
          <p className="text-muted mb-3">No alerts set yet. Choose a product offer to create an alert.</p>
          <div>
            <Link to="/search" className="btn btn-primary btn-sm">
              Search Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="card shadow-sm">
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="h6 mb-1">{alert.offer?.title || 'Alert Rule'}</h2>
                  <div className="small text-muted mb-2">
                    Type: <span className="fw-semibold">{alert.type === 'target_price' ? 'Target Price' : 'Fixed Drop'}</span>
                    {' · '}
                    Threshold:{' '}
                    <span className="fw-semibold">
                      ₹
                      {alert.type === 'target_price'
                        ? ((alert.targetPriceInPaise || 0) / 100).toLocaleString('en-IN')
                        : ((alert.dropAmountInPaise || 0) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className={`badge ${alert.status === 'active' ? 'bg-success' : 'bg-secondary'} me-2`}>
                      {alert.status}
                    </span>
                    <span className="badge bg-light text-dark border">
                      Channels: {(alert.channels || []).join(', ')}
                    </span>
                  </div>
                </div>
                <div>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(alert.id)}>
                    Delete
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
