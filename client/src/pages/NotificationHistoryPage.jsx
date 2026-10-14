import { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function NotificationHistoryPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await api.getNotifications();
        setEvents(data?.notifications || []);
      } catch (err) {
        console.error('Failed to load notification events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, []);

  return (
    <div>
      <h1 className="h4 mb-4">Notification History</h1>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center p-5 shadow-sm">
          <p className="text-muted mb-0">No notification events recorded yet.</p>
        </div>
      ) : (
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Channel</th>
                <th scope="col">Status</th>
                <th scope="col">Message</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => (
                <tr key={evt.id}>
                  <td className="small text-nowrap">
                    {new Date(evt.createdAt).toLocaleString()}
                  </td>
                  <td className="text-capitalize small">{evt.channel}</td>
                  <td>
                    <span
                      className={`badge ${
                        evt.status === 'sent'
                          ? 'bg-success'
                          : evt.status === 'skipped_duplicate'
                          ? 'bg-secondary'
                          : 'bg-danger'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="small">{evt.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
