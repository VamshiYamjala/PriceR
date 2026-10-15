import { useEffect, useState, useRef } from 'react';
import * as api from '../services/api';

export default function NotificationPreferencesPage() {
  const [email, setEmail] = useState('');
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState(null);
  const [linkData, setLinkData] = useState(null); // { linkCode, botUsername, botDeepLink }
  const [manualCode, setManualCode] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const pollTimerRef = useRef(null);

  async function loadPreferences() {
    try {
      const data = await api.getNotificationPreferences();
      if (data?.email) setEmail(data.email);
      setTelegramLinked(Boolean(data?.telegramLinked));
      setTelegramChatId(data?.telegramChatId || null);
      if (data?.telegramLinked) {
        setLinkData(null);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPreferences();
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  async function handleSaveEmail(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await api.updateNotificationPreferences({ email });
      setMessage('Email preference saved successfully.');
    } catch (err) {
      setError('Failed to update email preferences.');
    }
  }

  async function handleStartConnect() {
    setError(null);
    setMessage(null);
    setActionLoading(true);
    try {
      const res = await api.getTelegramLinkCode();
      setLinkData(res);
      setManualCode(res.linkCode);

      // Start automatic polling every 3 seconds to check if user pressed /start in Telegram
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = setInterval(async () => {
        try {
          const pref = await api.getNotificationPreferences();
          if (pref?.telegramLinked) {
            setTelegramLinked(true);
            setTelegramChatId(pref.telegramChatId);
            setLinkData(null);
            setMessage('🎉 Telegram connected successfully!');
            clearInterval(pollTimerRef.current);
          }
        } catch (_) {}
      }, 3000);
    } catch (err) {
      setError('Failed to generate Telegram linking code.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleManualLink(e) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    setError(null);
    setMessage(null);
    setActionLoading(true);
    try {
      await api.linkTelegram(manualCode.trim());
      await loadPreferences();
      setMessage('Telegram linked successfully!');
      setLinkData(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to verify code. Make sure you pressed Start in the bot.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDisconnect() {
    if (!window.confirm('Are you sure you want to disconnect Telegram notifications?')) {
      return;
    }
    setError(null);
    setMessage(null);
    setActionLoading(true);
    try {
      await api.disconnectTelegram();
      setTelegramLinked(false);
      setTelegramChatId(null);
      setMessage('Telegram account disconnected.');
    } catch (err) {
      setError('Failed to disconnect Telegram.');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-8 col-lg-7">
        <div className="card shadow-sm mb-4 border bg-white">
          <div className="card-body p-4">
            <h1 className="h5 fw-bold mb-3">Notification Preferences</h1>
            <p className="text-muted small mb-4">
              Configure how you receive real-time price-drop alerts for items in your watchlist.
            </p>

            {message && <div className="alert alert-success py-2 small">{message}</div>}
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary" role="status" />
              </div>
            ) : (
              <>
                {/* Email Section */}
                <form onSubmit={handleSaveEmail} className="mb-4">
                  <h2 className="h6 fw-bold mb-2">📧 Email Notifications</h2>
                  <div className="mb-3">
                    <label className="form-label small text-muted" htmlFor="pref-email">
                      Registered Alert Email
                    </label>
                    <input
                      id="pref-email"
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-outline-primary btn-sm">
                    Save Email Address
                  </button>
                </form>

                <hr className="my-4" />

                {/* Telegram Section */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h2 className="h6 fw-bold mb-0">✈️ Telegram Notifications</h2>
                    {telegramLinked ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        ● Connected
                      </span>
                    ) : (
                      <span className="badge bg-secondary-subtle text-secondary border">
                        Not Connected
                      </span>
                    )}
                  </div>

                  {telegramLinked ? (
                    <div className="p-3 bg-light rounded border mb-3">
                      <p className="small mb-1 text-dark fw-semibold">
                        ✅ Connected to @PriceRadar_Alerts_Bot
                      </p>
                      {telegramChatId && (
                        <p className="small text-muted mb-3 font-monospace">
                          Chat ID: {telegramChatId}
                        </p>
                      )}
                      <p className="small text-muted mb-3">
                        You can now choose Telegram when creating or editing price alerts.
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleDisconnect}
                        disabled={actionLoading}
                      >
                        {actionLoading ? 'Disconnecting…' : 'Disconnect Telegram'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="small text-muted mb-3">
                        Receive instantaneous price alerts in Telegram via <strong>@PriceRadar_Alerts_Bot</strong>.
                      </p>

                      {!linkData ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleStartConnect}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Generating Link…' : 'Connect Telegram'}
                        </button>
                      ) : (
                        <div className="p-3 bg-light rounded border">
                          <h3 className="h6 fw-bold mb-2">Step 1: Open Bot &amp; Press Start</h3>
                          <p className="small text-muted mb-3">
                            Click the button below to open Telegram and press <strong>Start</strong>. Your code will be automatically recognized:
                          </p>
                          <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                            <a
                              href={linkData.botDeepLink || `https://t.me/${linkData.botUsername}?start=${linkData.linkCode}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                            >
                              Open @{linkData.botUsername} in Telegram ↗
                            </a>
                            <span className="small text-muted">
                              One-time code: <strong className="font-monospace text-dark fs-6">{linkData.linkCode}</strong>
                            </span>
                          </div>

                          <div className="d-flex align-items-center gap-2 small text-muted mb-3">
                            <div className="spinner-grow spinner-grow-sm text-primary" role="status" />
                            <span>Waiting for you to click Start in Telegram...</span>
                          </div>

                          <hr className="my-2" />

                          <form onSubmit={handleManualLink} className="mt-2">
                            <label className="form-label small text-muted" htmlFor="manual-code">
                              Or enter code manually if needed:
                            </label>
                            <div className="input-group input-group-sm" style={{ maxWidth: '300px' }}>
                              <input
                                id="manual-code"
                                type="text"
                                className="form-control font-monospace"
                                placeholder="6-digit code"
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value)}
                              />
                              <button type="submit" className="btn btn-outline-secondary" disabled={actionLoading}>
                                Verify
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
