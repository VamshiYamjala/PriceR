import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [watchlistData, alertsData] = await Promise.allSettled([
          api.getWatchlist(),
          api.getAlerts(),
        ]);

        if (watchlistData.status === 'fulfilled') {
          setWatchlist(watchlistData.value?.items || []);
        }
        if (alertsData.status === 'fulfilled') {
          setAlerts(alertsData.value?.alerts || []);
        }
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Welcome back, {user?.name || 'Shopper'}!</h1>
          <p className="text-muted mb-0">Your PriceRadar watchlist and alert overview</p>
        </div>
        <Link to="/search" className="btn btn-primary">
          Search Products
        </Link>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Watchlist ({watchlist.length})</h2>
                <Link to="/watchlist" className="btn btn-sm btn-outline-primary">
                  View All
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                </div>
              ) : watchlist.length === 0 ? (
                <p className="text-muted small">No items in your watchlist yet. Search for products to add them.</p>
              ) : (
                <p className="text-muted small">You are tracking {watchlist.length} item(s).</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Active Alerts ({alerts.length})</h2>
                <Link to="/alerts" className="btn btn-sm btn-outline-primary">
                  Manage Alerts
                </Link>
              </div>
              {loading ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" />
                </div>
              ) : alerts.length === 0 ? (
                <p className="text-muted small">No active alerts configured. Set up alerts on watched items.</p>
              ) : (
                <p className="text-muted small">You have {alerts.length} active alert rule(s).</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
