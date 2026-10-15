import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import InternalSidebar from '../components/InternalSidebar';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, [isAuthenticated]);

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
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <span className="pr-section-eyebrow d-block mb-1">YOUR PRICERADAR</span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
            {isAuthenticated ? `Welcome back, ${user?.name || 'Shopper'}` : 'Overview'}
          </h1>
          <p className="text-muted small mb-0">
            Multi-store price monitoring, background refresh, and price-drop alert center.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          {isAuthenticated && (
            <button
              type="button"
              className="btn btn-pr-secondary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5"
              onClick={handleRefreshNow}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" />
                  <span>Refreshing…</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Refresh Prices</span>
                </>
              )}
            </button>
          )}
          <Link to="/search" className="btn btn-pr-primary btn-sm px-3 py-2">
            🔍 Search Products
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-12 col-lg-3">
          <InternalSidebar />
        </div>

        {/* Dashboard Content */}
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
                Sign in to view your dashboard
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                Your overview metrics, recent watchlist products, active price alerts, and connected notification channels will appear here.
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
          ) : (
            <>
              {refreshResult && (
                <div
                  className={`alert ${
                    refreshResult.success ? 'alert-success' : 'alert-danger'
                  } alert-dismissible fade show py-2 px-3 small mb-4 rounded-3`}
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

              {/* 4 Metric Cards */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6 col-lg-3">
                  <div
                    className="p-3.5 rounded-4 bg-white h-100"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted small fw-semibold text-uppercase tracking-wider d-block mb-1">
                      Watchlist
                    </span>
                    <div className="fs-3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)' }}>
                      {loading ? '—' : watchlist.length}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Tracked listings</span>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div
                    className="p-3.5 rounded-4 bg-white h-100"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted small fw-semibold text-uppercase tracking-wider d-block mb-1">
                      Active Alerts
                    </span>
                    <div className="fs-3 fw-bold mb-1" style={{ color: 'var(--pr-forest)' }}>
                      {loading ? '—' : alerts.length}
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Target &amp; drop rules</span>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div
                    className="p-3.5 rounded-4 bg-white h-100"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted small fw-semibold text-uppercase tracking-wider d-block mb-1">
                      Refresh Cadence
                    </span>
                    <div className="fs-3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)' }}>
                      4.0h
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Automated cycle</span>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div
                    className="p-3.5 rounded-4 bg-white h-100"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted small fw-semibold text-uppercase tracking-wider d-block mb-1">
                      Alert Channels
                    </span>
                    <div className="d-flex gap-1.5 align-items-center mb-1 mt-1">
                      <span className="badge rounded-pill pr-badge-live px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                        Email
                      </span>
                      <span className="badge rounded-pill pr-badge-live px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                        Telegram
                      </span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>Instant delivery</span>
                  </div>
                </div>
              </div>

              {/* Quick Panels Row */}
              <div className="row g-4">
                {/* Watchlist & Alerts */}
                <div className="col-lg-7">
                  {/* Recent Watchlist */}
                  <div
                    className="p-4 rounded-4 bg-white mb-4"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div>
                        <span className="pr-section-eyebrow d-block mb-0.5">SAVED ITEMS</span>
                        <h2 className="h6 fw-bold mb-0" style={{ color: 'var(--pr-text-dark)' }}>
                          Recent Watchlist
                        </h2>
                      </div>
                      <Link to="/watchlist" className="small fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                        View all ({watchlist.length}) →
                      </Link>
                    </div>

                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm" style={{ color: 'var(--pr-forest)' }} role="status" />
                      </div>
                    ) : watchlist.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted small mb-2">Your watchlist is currently empty.</p>
                        <Link to="/search" className="btn btn-pr-outline-forest btn-sm px-3 py-1.5">
                          Search &amp; Add Products
                        </Link>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2.5">
                        {watchlist.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="d-flex justify-content-between align-items-center p-2.5 rounded-3"
                            style={{ background: 'var(--pr-bg-soft)', border: '1px solid var(--pr-border)' }}
                          >
                            <div className="text-truncate me-2" style={{ maxWidth: '65%' }}>
                              <div className="fw-semibold small text-truncate" style={{ color: 'var(--pr-text-dark)' }}>
                                {item.offer?.title || 'Tracked Offer'}
                              </div>
                              <span
                                className="badge text-uppercase tracking-wider fw-semibold px-2 py-0.5 rounded-pill"
                                style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.68rem' }}
                              >
                                {item.offer?.provider}
                              </span>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold small" style={{ color: 'var(--pr-forest)' }}>
                                ₹{((item.offer?.priceInPaise || 0) / 100).toLocaleString('en-IN')}
                              </div>
                              <Link
                                to={`/alerts/new?offerId=${item.offer?.id || item.offer?._id}`}
                                className="small fw-semibold text-decoration-none"
                                style={{ color: 'var(--pr-forest)', fontSize: '0.75rem' }}
                              >
                                Set Alert
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Configured Alerts */}
                  <div
                    className="p-4 rounded-4 bg-white"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                      <div>
                        <span className="pr-section-eyebrow d-block mb-0.5">MONITORING</span>
                        <h2 className="h6 fw-bold mb-0" style={{ color: 'var(--pr-text-dark)' }}>
                          Configured Price Alerts
                        </h2>
                      </div>
                      <div className="d-flex gap-2">
                        <Link to="/notifications" className="small fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                          Logs →
                        </Link>
                        <Link to="/alerts" className="small fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                          Manage ({alerts.length}) →
                        </Link>
                      </div>
                    </div>

                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border spinner-border-sm" style={{ color: 'var(--pr-forest)' }} role="status" />
                      </div>
                    ) : alerts.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted small mb-2">No active price drop rules configured.</p>
                        <Link to="/watchlist" className="btn btn-pr-outline-forest btn-sm px-3 py-1.5">
                          Create Alert from Watchlist
                        </Link>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2.5">
                        {alerts.slice(0, 4).map((alert) => (
                          <div
                            key={alert.id}
                            className="d-flex justify-content-between align-items-center p-2.5 rounded-3"
                            style={{ background: 'var(--pr-bg-soft)', border: '1px solid var(--pr-border)' }}
                          >
                            <div className="text-truncate me-2" style={{ maxWidth: '65%' }}>
                              <div className="fw-semibold small text-truncate" style={{ color: 'var(--pr-text-dark)' }}>
                                {alert.offer?.title || `Alert Rule (${alert.id.substring(0, 8)})`}
                              </div>
                              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                                <span className="fw-medium">
                                  {alert.type === 'target_price'
                                    ? `≤ ₹${((alert.targetPriceInPaise || 0) / 100).toLocaleString('en-IN')}`
                                    : `≥ ₹${((alert.dropAmountInPaise || 0) / 100).toLocaleString('en-IN')}`}
                                </span>
                              </div>
                            </div>
                            <div className="text-end">
                              <span
                                className="badge rounded-pill px-2 py-0.5 fw-semibold"
                                style={{
                                  background: alert.armed ? 'var(--pr-mint-bg)' : '#FEF3C7',
                                  color: alert.armed ? 'var(--pr-forest)' : '#92400E',
                                  fontSize: '0.7rem',
                                }}
                              >
                                {alert.armed ? 'Armed' : 'Triggered'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Sources / Architecture */}
                <div className="col-lg-5">
                  <div
                    className="p-4 rounded-4 bg-white h-100"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="pr-section-eyebrow d-block mb-0.5">SOURCE INTELLIGENCE</span>
                    <h2 className="h6 fw-bold mb-3 pb-2 border-bottom" style={{ color: 'var(--pr-text-dark)' }}>
                      Connected Retailers &amp; Feeds
                    </h2>
                    <div className="d-flex flex-column gap-3">
                      {providers.map((prov) => (
                        <div
                          key={prov.id}
                          className="p-3 rounded-3"
                          style={{ background: 'var(--pr-bg-soft)', border: '1px solid var(--pr-border)' }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold small" style={{ color: 'var(--pr-text-dark)' }}>
                              {prov.name}
                            </span>
                            <span
                              className={`badge rounded-pill px-2 py-0.5 ${
                                prov.status === 'active' || prov.status === 'configured'
                                  ? 'pr-badge-live'
                                  : 'bg-secondary-subtle text-secondary'
                              }`}
                              style={{ fontSize: '0.7rem' }}
                            >
                              {prov.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-muted small mb-2" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                            {prov.description}
                          </p>
                          <div className="d-flex gap-1.5 flex-wrap">
                            <span
                              className="badge rounded-pill px-2 py-0.5"
                              style={{ background: '#FFFFFF', color: 'var(--pr-text-dark)', border: '1px solid var(--pr-border)', fontSize: '0.7rem' }}
                            >
                              {prov.type}
                            </span>
                            {prov.requiresAuth && (
                              <span
                                className="badge rounded-pill px-2 py-0.5"
                                style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.7rem' }}
                              >
                                Token Configured
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
