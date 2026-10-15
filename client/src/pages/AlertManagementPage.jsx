import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

export default function AlertManagementPage() {
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
    loadAlerts();
  }, []);

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

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1">Manage Price Alerts</h1>
          <p className="text-muted small mb-0">
            Rules are evaluated immediately upon creation and during the 4-hour background cycle.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
            onClick={handleRefreshNow}
            disabled={refreshing}
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>Checking Prices...</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Refresh & Check Now</span>
              </>
            )}
          </button>
          <Link to="/notifications" className="btn btn-outline-secondary btn-sm">
            📜 Delivery Log
          </Link>
          <Link to="/watchlist" className="btn btn-primary btn-sm">
            + New Alert
          </Link>
        </div>
      </div>

      {refreshResult && (
        <div
          className={`alert ${
            refreshResult.success ? 'alert-success' : 'alert-danger'
          } alert-dismissible fade show py-2 small mb-3`}
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
              <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <h2 className="h6 mb-1">{alert.offer?.title || `Alert Rule (${alert.id.substring(0, 8)})`}</h2>
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
                    {alert.offer?.priceInPaise && (
                      <span className="ms-2">
                        (Current: ₹{((alert.offer.priceInPaise) / 100).toLocaleString('en-IN')})
                      </span>
                    )}
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-1">
                    <span className={`badge ${alert.status === 'active' ? 'bg-success' : 'bg-secondary'} me-1`}>
                      {alert.status}
                    </span>
                    <span className={`badge ${alert.armed ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'} me-1`}>
                      {alert.armed ? 'Armed' : 'Triggered'}
                    </span>
                    <span className="badge bg-light text-dark border me-1">
                      Channels: {(alert.channels || []).join(', ')}
                    </span>
                    {alert.lastTriggeredAt && (
                      <span className="small text-muted">
                        Last fired: {new Date(alert.lastTriggeredAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${alert.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => handleToggleStatus(alert)}
                  >
                    {alert.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <Link to={`/alerts/${alert.id}/edit`} className="btn btn-outline-secondary btn-sm">
                    Edit
                  </Link>
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
