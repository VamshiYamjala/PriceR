import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);

  async function loadDashboardData() {
    try {
      const [watchlistData, alertsData, providersData] = await Promise.allSettled([
        api.getWatchlist(),
        api.getAlerts(),
        api.getProviderStatus(),
      ]);

      if (watchlistData.status === 'fulfilled') {
        setWatchlist(watchlistData.value?.items || []);
      }
      if (alertsData.status === 'fulfilled') {
        setAlerts(alertsData.value?.alerts || []);
      }
      if (providersData.status === 'fulfilled') {
        setProviders(providersData.value?.providers || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleRefreshNow() {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await api.triggerPriceRefresh();
      setRefreshResult({
        success: true,
        message: `Price refresh completed! Checked ${res.offersChecked || 0} offers, triggered ${res.triggeredAlerts || 0} alert notification(s).`,
      });
      await loadDashboardData();
    } catch (err) {
      setRefreshResult({
        success: false,
        message: err.response?.data?.error?.message || 'Price evaluation cycle encountered an error.',
      });
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <div className="py-2">
      {/* Top Banner / Welcome */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 p-4 rounded-3 bg-white border shadow-sm">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h1 className="h4 mb-0 fw-bold text-dark">Welcome back, {user?.name || 'Shopper'}!</h1>
            <span className="badge bg-success-subtle text-success border border-success-subtle small">
              Active Session
            </span>
          </div>
          <p className="text-muted small mb-0">
            Real-time multi-provider price monitoring, background refresh, and drop alert center.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary px-3 shadow-sm d-flex align-items-center gap-1"
            onClick={handleRefreshNow}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh Prices</span>
              </>
            )}
          </button>
          <Link to="/search" className="btn btn-primary px-3 shadow-sm">
            🔍 Search Products
          </Link>
          <Link to="/watchlist" className="btn btn-outline-secondary px-3">
            📋 My Watchlist
          </Link>
        </div>
      </div>

      {refreshResult && (
        <div
          className={`alert ${
            refreshResult.success ? 'alert-success' : 'alert-danger'
          } alert-dismissible fade show py-2 small mb-4`}
          role="alert"
        >
          {refreshResult.message}
          <button
            type="button"
            className="btn-close py-2"
            aria-label="Close"
            onClick={() => setRefreshResult(null)}
          />
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Watchlist</span>
              <span className="fs-5">📋</span>
            </div>
            <div className="fs-2 fw-bold text-dark mb-1">
              {loading ? '-' : watchlist.length}
            </div>
            <span className="text-muted small">Tracked listings in inventory</span>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Active Alerts</span>
              <span className="fs-5">🔔</span>
            </div>
            <div className="fs-2 fw-bold text-primary mb-1">
              {loading ? '-' : alerts.length}
            </div>
            <span className="text-muted small">Target & fixed drop rules</span>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Refresh Cadence</span>
              <span className="fs-5">⏱️</span>
            </div>
            <div className="fs-2 fw-bold text-dark mb-1">4.0h</div>
            <span className="text-muted small">Automated background cycle</span>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card h-100 border-0 shadow-sm p-3 bg-white">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted small fw-semibold text-uppercase tracking-wider">Alert Channels</span>
              <span className="fs-5">📡</span>
            </div>
            <div className="d-flex gap-1 align-items-center mb-1 mt-1">
              <span className="badge bg-primary-subtle text-primary border small">Brevo Email</span>
              <span className="badge bg-info-subtle text-info-emphasis border small">Telegram</span>
            </div>
            <span className="text-muted small">Multi-channel instant delivery</span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Watchlist & Alerts Quick Panel */}
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm p-3 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h2 className="h6 mb-0 fw-bold">Recent Watchlist Items</h2>
              <Link to="/watchlist" className="btn btn-sm btn-link text-decoration-none">
                View all ({watchlist.length}) →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              </div>
            ) : watchlist.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted small mb-2">Your watchlist is currently empty.</p>
                <Link to="/search" className="btn btn-sm btn-outline-primary">
                  Search & Add Products
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {watchlist.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="d-flex justify-content-between align-items-center p-2 rounded bg-light border-0"
                  >
                    <div className="text-truncate me-2" style={{ maxWidth: '65%' }}>
                      <div className="fw-semibold text-dark small text-truncate">
                        {item.offer?.title || 'Tracked Offer'}
                      </div>
                      <span className="badge bg-white text-secondary border small text-capitalize">
                        {item.offer?.provider}
                      </span>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold small text-dark">
                        ₹{((item.offer?.priceInPaise || 0) / 100).toLocaleString('en-IN')}
                      </div>
                      <Link to={`/alerts/new?offerId=${item.offer?.id || item.offer?._id}`} className="small text-primary">
                        Set Alert
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card border-0 shadow-sm p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h2 className="h6 mb-0 fw-bold">Configured Price Alerts</h2>
              <Link to="/alerts" className="btn btn-sm btn-link text-decoration-none">
                Manage alerts ({alerts.length}) →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted small mb-2">No active price drop rules configured.</p>
                <Link to="/watchlist" className="btn btn-sm btn-outline-secondary">
                  Create Alert from Watchlist
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.id}
                    className="d-flex justify-content-between align-items-center p-2 rounded bg-light border-0"
                  >
                    <div>
                      <span className="badge bg-primary text-white me-2 small text-uppercase">
                        {alert.type === 'target_price' ? 'Target Price' : 'Fixed Drop'}
                      </span>
                      <span className="small text-muted">
                        {alert.type === 'target_price'
                          ? `≤ ₹${(alert.targetPriceInPaise / 100).toLocaleString('en-IN')}`
                          : `Drop ≥ ₹${(alert.dropAmountInPaise / 100).toLocaleString('en-IN')}`}
                      </span>
                    </div>
                    <span className={`badge ${alert.armed ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'} small`}>
                      {alert.armed ? 'Armed' : 'Triggered'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Data Sources & System Status */}
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm p-3 bg-white h-100">
            <h2 className="h6 fw-bold mb-3 pb-2 border-bottom">Data Sources & Provider Architecture</h2>
            <div className="d-flex flex-column gap-3">
              {providers.map((prov) => (
                <div key={prov.id} className="p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-dark">{prov.name}</span>
                    <span
                      className={`badge small ${
                        prov.status === 'active' || prov.status === 'configured'
                          ? 'bg-success-subtle text-success'
                          : 'bg-secondary-subtle text-secondary'
                      }`}
                    >
                      {prov.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-muted small mb-1" style={{ fontSize: '0.8rem' }}>
                    {prov.description}
                  </p>
                  <div className="d-flex gap-2">
                    <span className="badge bg-white text-muted border" style={{ fontSize: '0.75rem' }}>
                      Type: {prov.type}
                    </span>
                    {prov.requiresAuth && (
                      <span className="badge bg-white text-muted border" style={{ fontSize: '0.75rem' }}>
                        OAuth/Token Required
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
