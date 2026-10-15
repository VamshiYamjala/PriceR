import { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function NotificationHistoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h1 className="h4 fw-bold mb-1">Notification Delivery Log</h1>
          <p className="text-muted small mb-0">
            Real-time audit log of price-alert dispatches across Email (Brevo) and Telegram channels.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border bg-light">
          <p className="text-muted mb-0">No notification events recorded yet.</p>
        </div>
      ) : (
        <div className="card shadow-sm border overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-uppercase small" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                <tr>
                  <th scope="col" className="ps-3">Date &amp; Time</th>
                  <th scope="col">Channel</th>
                  <th scope="col">Recipient</th>
                  <th scope="col">Delivery Status</th>
                  <th scope="col">Alert Details</th>
                </tr>
              </thead>
              <tbody className="small">
                {events.map((evt) => (
                  <tr key={evt.id}>
                    <td className="ps-3 text-nowrap text-muted font-monospace" style={{ fontSize: '0.8rem' }}>
                      {new Date(evt.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border text-capitalize">
                        {evt.channel === 'email' ? '📧 Email' : '✈️ Telegram'}
                      </span>
                    </td>
                    <td className="font-monospace text-muted">
                      {maskRecipient(evt.recipient, evt.channel)}
                    </td>
                    <td>
                      {evt.status === 'sent' && evt.channel === 'email' ? (
                        <div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold">
                            ● Accepted by Brevo
                          </span>
                          <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                            {evt.providerMessageId ? (
                              <span className="font-monospace text-truncate d-block" style={{ maxWidth: '220px' }} title={evt.providerMessageId}>
                                ID: {evt.providerMessageId}
                              </span>
                            ) : null}
                            <span className="text-secondary">(Provider accepted; inbox delivery unconfirmed)</span>
                          </div>
                        </div>
                      ) : evt.status === 'sent' && evt.channel === 'telegram' ? (
                        <div>
                          <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold">
                            ● Delivered to Telegram
                          </span>
                        </div>
                      ) : evt.status === 'skipped_duplicate' ? (
                        <div>
                          <span className="badge bg-secondary-subtle text-secondary border fw-normal">
                            Duplicate Suppressed
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-semibold">
                            ● Dispatch Failed
                          </span>
                          {evt.errorMessage && (
                            <div className="text-danger mt-1 text-wrap" style={{ fontSize: '0.75rem', maxWidth: '280px' }}>
                              {evt.errorMessage}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="text-dark fw-medium text-wrap" style={{ maxWidth: '360px' }}>
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
  );
}
