import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternalSidebar from '../components/InternalSidebar';

export default function AlertManagementPage() {
  const { isAuthenticated } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState(null);

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

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadAlerts();
  }, [isAuthenticated]);

  async function handleRefreshNow() {
    setRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await api.triggerPriceRefresh();
      setRefreshResult({
        success: true,
        message: `Evaluation complete! Checked ${res.offersChecked || 0} offers, triggered ${res.triggeredAlerts || 0} alert notification(s).`,
      });
      await loadAlerts();
    } catch (err) {
      setRefreshResult({
        success: false,
        message: err.response?.data?.error?.message || 'Price evaluation cycle encountered an error.',
      });
    } finally {
      setRefreshing(false);
    }
  }

  async function handleToggleStatus(alert) {
    const nextStatus = alert.status === 'active' ? 'paused' : 'active';
    try {
      const data = await api.updateAlert(alert.id, { status: nextStatus });
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? { ...a, status: data.alert?.status || nextStatus } : a))
      );
    } catch (err) {
      console.error('Failed to toggle alert status:', err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  }

  const totalCount = alerts.length;
  const armedCount = alerts.filter((a) => a.armed && a.status === 'active').length;
  const triggeredCount = alerts.filter((a) => !a.armed).length;

  return (
    <div className="py-2">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <span className="pr-section-eyebrow d-block mb-1">YOUR PRICERADAR</span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
            Price alerts
          </h1>
          <p className="text-muted small mb-0">
            Rules evaluate immediately on creation and during the 4-hour background cycle.
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-pr-secondary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5"
            onClick={handleRefreshNow}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>Checking Prices…</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh & Check Now</span>
              </>
            )}
          </button>
          <Link to="/notifications" className="btn btn-pr-outline-forest btn-sm px-3 py-2">
            Delivery log
          </Link>
          <Link to="/search" className="btn btn-pr-primary btn-sm px-3 py-2">
            + New Alert
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-12 col-lg-3">
          <InternalSidebar />
        </div>

        {/* Alerts Content */}
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                Sign in to manage your price alerts
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                Set target price thresholds and receive instant alerts via Email and Telegram when retailer prices drop.
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
              {/* Summary Metric Strip */}
              <div className="row g-3 mb-4">
                <div className="col-sm-4">
                  <div
                    className="p-3 rounded-4 bg-white text-center"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted d-block small fw-medium mb-1">Total Rules</span>
                    <span className="fs-4 fw-bold" style={{ color: 'var(--pr-text-dark)' }}>
                      {totalCount}
                    </span>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div
                    className="p-3 rounded-4 bg-white text-center"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted d-block small fw-medium mb-1">Armed &amp; Monitoring</span>
                    <span className="fs-4 fw-bold" style={{ color: 'var(--pr-forest)' }}>
                      {armedCount}
                    </span>
                  </div>
                </div>
                <div className="col-sm-4">
                  <div
                    className="p-3 rounded-4 bg-white text-center"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <span className="text-muted d-block small fw-medium mb-1">Triggered</span>
                    <span className="fs-4 fw-bold" style={{ color: '#D97706' }}>
                      {triggeredCount}
                    </span>
                  </div>
                </div>
              </div>

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

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: 'var(--pr-forest)' }} role="status">
                    <span className="visually-hidden">Loading alerts…</span>
                  </div>
                </div>
              ) : alerts.length === 0 ? (
                <div
                  className="p-5 text-center rounded-4 bg-white"
                  style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '64px', height: '64px', background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </div>
                  <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                    No alerts configured yet
                  </h2>
                  <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                    Choose a product offer to set up an alert threshold. We will monitor it every four hours and ping you immediately when prices drop.
                  </p>
                  <Link to="/search" className="btn btn-pr-primary px-4 py-2">
                    Search products →
                  </Link>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {alerts.map((alert) => {
                    const isTarget = alert.type === 'target_price';
                    const thresholdVal = isTarget
                      ? ((alert.targetPriceInPaise || 0) / 100).toLocaleString('en-IN')
                      : ((alert.dropAmountInPaise || 0) / 100).toLocaleString('en-IN');
                    const currentPrice = alert.offer?.priceInPaise
                      ? ((alert.offer.priceInPaise) / 100).toLocaleString('en-IN')
                      : null;

                    return (
                      <div
                        key={alert.id}
                        className="p-3 p-md-4 rounded-4 bg-white d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                        style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span
                              className={`badge rounded-pill px-2.5 py-0.5 fw-semibold ${
                                alert.status === 'active' ? 'pr-badge-live' : 'bg-secondary-subtle text-secondary'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {alert.status === 'active' ? '● Active' : '○ Paused'}
                            </span>
                            <span
                              className="badge rounded-pill px-2.5 py-0.5 fw-semibold"
                              style={{
                                background: alert.armed ? 'var(--pr-mint-bg)' : '#FEF3C7',
                                color: alert.armed ? 'var(--pr-forest)' : '#92400E',
                                fontSize: '0.72rem',
                              }}
                            >
                              {alert.armed ? 'Armed' : 'Triggered'}
                            </span>
                            <span
                              className="badge text-uppercase tracking-wider px-2 py-0.5 rounded-pill"
                              style={{ background: 'var(--pr-bg-soft)', color: 'var(--pr-text-dark)', fontSize: '0.68rem', border: '1px solid var(--pr-border)' }}
                            >
                              {(alert.channels || []).join(' + ')}
                            </span>
                          </div>

                          <h2 className="h6 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)' }}>
                            {alert.offer?.title || `Alert Rule #${alert.id.substring(0, 8)}`}
                          </h2>

                          <div className="small text-muted mb-1">
                            <span>Condition: </span>
                            <strong style={{ color: 'var(--pr-text-dark)' }}>
                              {isTarget ? `Target price ≤ ₹${thresholdVal}` : `Drop ≥ ₹${thresholdVal}`}
                            </strong>
                            {currentPrice && (
                              <span className="ms-2">
                                (Current: <span className="fw-semibold text-dark">₹{currentPrice}</span>)
                              </span>
                            )}
                          </div>

                          {alert.lastTriggeredAt && (
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              Last triggered: {new Date(alert.lastTriggeredAt).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>

                        <div className="d-flex align-items-center gap-2 align-self-end align-self-md-center">
                          <button
                            type="button"
                            className="btn btn-pr-outline-forest btn-sm px-3 py-1.5"
                            onClick={() => handleToggleStatus(alert)}
                          >
                            {alert.status === 'active' ? 'Pause' : 'Resume'}
                          </button>
                          <Link
                            to={`/alerts/${alert.id}/edit`}
                            className="btn btn-pr-secondary btn-sm px-3 py-1.5"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            className="btn btn-link text-danger text-decoration-none small px-2 py-1"
                            onClick={() => handleDelete(alert.id)}
                            title="Delete alert"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
