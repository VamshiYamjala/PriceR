import { useEffect, useState } from 'react';
import * as api from '../services/api';

export default function NotificationPreferencesPage() {
  const [email, setEmail] = useState('');
  const [linkCode, setLinkCode] = useState('');
  const [telegramStatus, setTelegramStatus] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const data = await api.getNotificationPreferences();
        if (data?.email) setEmail(data.email);
        if (data?.telegramLinked) {
          setTelegramStatus('Linked');
        } else {
          setTelegramStatus('Not Linked');
        }
      } catch (err) {
        console.error('Failed to load preferences:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  async function handleSaveEmail(e) {
    e.preventDefault();
    try {
      await api.updateNotificationPreferences({ email });
      setMessage('Preferences updated successfully.');
    } catch (err) {
      setMessage('Failed to update preferences.');
    }
  }

  async function handleTelegramLink(e) {
    e.preventDefault();
    try {
      await api.linkTelegram(linkCode);
      setTelegramStatus('Linked');
      setMessage('Telegram linked successfully!');
      setLinkCode('');
    } catch (err) {
      setMessage('Failed to link Telegram. Make sure the code is valid.');
    }
  }

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow-sm mb-4">
          <div className="card-body p-4">
            <h1 className="h5 mb-3">Notification Preferences</h1>

            {message && <div className="alert alert-info py-2">{message}</div>}

            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              </div>
            ) : (
              <>
                <form onSubmit={handleSaveEmail} className="mb-4">
                  <h2 className="h6 fw-bold">Email Notifications</h2>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="pref-email">Notification Email</label>
                    <input
                      id="pref-email"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-outline-primary btn-sm">
                    Save Email Preference
                  </button>
                </form>

                <hr />

                <form onSubmit={handleTelegramLink}>
                  <h2 className="h6 fw-bold">Telegram Notifications</h2>
                  <p className="small text-muted mb-2">
                    Status: <span className="fw-semibold">{telegramStatus}</span>
                  </p>
                  <p className="small text-muted mb-3">
                    To connect Telegram, send <code>/start</code> to the PriceRadar Bot and paste your one-time code below.
                  </p>
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter 6-digit Telegram code"
                      value={linkCode}
                      onChange={(e) => setLinkCode(e.target.value)}
                    />
                    <button type="submit" className="btn btn-outline-secondary">
                      Link
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
