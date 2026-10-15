import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternalSidebar from '../components/InternalSidebar';

export default function NotificationHistoryPage() {
  const { isAuthenticated } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    async function loadNotifications() {
      try {
        const data = await api.getNotifications();
        setEvents(data?.events || data?.notifications || []);
      } catch (err) {
        console.error('Failed to load notification events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [isAuthenticated]);

  function maskRecipient(recipient, channel) {
    if (!recipient) return '—';
    if (channel === 'email' && recipient.includes('@')) {
      const parts = recipient.split('@');
      const name = parts[0];
      const domain = parts[1];
      if (name.length <= 2) return `${name.charAt(0)}***@${domain}`;
      return `${name.charAt(0)}***${name.charAt(name.length - 1)}@${domain}`;
    }
    if (channel === 'telegram') {
      return `Chat ID: ${recipient}`;
    }
    return recipient;
  }

  return (
    <div className="py-2">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <span className="pr-section-eyebrow d-block mb-1">YOUR PRICERADAR</span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
            Notifications
          </h1>
          <p className="text-muted small mb-0">
            Real-time audit log of price-alert dispatches across Email (Brevo) and Telegram channels.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/settings/notifications" className="btn btn-pr-secondary btn-sm px-3 py-2">
            ⚙️ Preferences
          </Link>
          <Link to="/alerts" className="btn btn-pr-outline-forest btn-sm px-3 py-2">
            Manage alerts
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-12 col-lg-3">
          <InternalSidebar />
        </div>

        {/* Delivery Log Content */}
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
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                Sign in to view notification logs
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                Every price-drop alert triggered by our automated monitoring system is preserved with full audit trail history.
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
          ) : loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: 'var(--pr-forest)' }} role="status">
                <span className="visually-hidden">Loading notification log…</span>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div
              className="p-5 text-center rounded-4 bg-white"
              style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
            >
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: '64px', height: '64px', background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                No notifications dispatched yet
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                When your tracked products drop below target prices, audit logs with provider confirmation IDs will appear here.
              </p>
              <Link to="/search" className="btn btn-pr-primary px-4 py-2">
                Explore products →
              </Link>
            </div>
          ) : (
            <div
              className="card border-0 rounded-4 bg-white overflow-hidden"
              style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
            >
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ background: 'var(--pr-bg-soft)' }}>
                    <tr>
                      <th className="py-2.5 ps-3 text-muted small fw-semibold">Timestamp</th>
                      <th className="py-2.5 text-muted small fw-semibold">Channel</th>
                      <th className="py-2.5 text-muted small fw-semibold">Recipient</th>
                      <th className="py-2.5 text-muted small fw-semibold">Delivery Status</th>
                      <th className="py-2.5 text-muted small fw-semibold">Alert Details</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {events.map((evt) => (
                      <tr key={evt.id}>
                        <td className="ps-3 text-nowrap text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                          {new Date(evt.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span
                            className="badge text-uppercase tracking-wider px-2 py-0.5 rounded-pill"
                            style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.7rem' }}
                          >
                            {evt.channel === 'email' ? '📧 Email' : '✈️ Telegram'}
                          </span>
                        </td>
                        <td className="font-monospace text-muted" style={{ fontSize: '0.8rem' }}>
                          {maskRecipient(evt.recipient, evt.channel)}
                        </td>
                        <td>
                          {evt.status === 'sent' && evt.channel === 'email' ? (
                            <div>
                              <span className="badge rounded-pill pr-badge-live px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                                ● Accepted by Brevo
                              </span>
                              {evt.providerMessageId && (
                                <div className="text-muted mt-1 font-monospace" style={{ fontSize: '0.7rem' }}>
                                  ID: {evt.providerMessageId.substring(0, 16)}…
                                </div>
                              )}
                            </div>
                          ) : evt.status === 'sent' && evt.channel === 'telegram' ? (
                            <div>
                              <span className="badge rounded-pill pr-badge-live px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                                ● Delivered to Telegram
                              </span>
                            </div>
                          ) : evt.status === 'skipped_duplicate' ? (
                            <div>
                              <span className="badge rounded-pill bg-secondary-subtle text-secondary px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                                Duplicate Suppressed
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="badge rounded-pill bg-danger-subtle text-danger px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                                ● Dispatch Failed
                              </span>
                              {evt.errorMessage && (
                                <div className="text-danger mt-1 text-truncate" style={{ fontSize: '0.7rem', maxWidth: '200px' }}>
                                  {evt.errorMessage}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-medium text-wrap" style={{ maxWidth: '340px', color: 'var(--pr-text-dark)', fontSize: '0.82rem' }}>
                            {evt.message}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
