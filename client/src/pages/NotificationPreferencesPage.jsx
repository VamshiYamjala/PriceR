import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternalSidebar from '../components/InternalSidebar';

export default function NotificationPreferencesPage() {
  const { isAuthenticated } = useAuth();
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
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadPreferences();
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isAuthenticated]);

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
    <div className="container py-4">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <span className="pr-section-eyebrow d-block mb-1">YOUR PRICERADAR</span>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
            Preferences
          </h1>
          <p className="text-muted small mb-0">
            Configure how and where you receive real-time price alerts.
          </p>
        </div>
      </div>

      <div className="row g-4">
        {/* Navigation Sidebar */}
        <div className="col-12 col-lg-3">
          <InternalSidebar />
        </div>

        {/* Preferences Content */}
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
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
              <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                Sign in to view notification preferences
              </h2>
              <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px' }}>
                Set up your Brevo verified email address and link your personal Telegram account to receive instant price-drop alerts.
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
            <div className="d-flex flex-column gap-4">
              {message && (
                <div className="alert alert-success py-2.5 px-3 small rounded-3" role="alert">
                  {message}
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2.5 px-3 small rounded-3" role="alert">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: 'var(--pr-forest)' }} role="status">
                    <span className="visually-hidden">Loading preferences…</span>
                  </div>
                </div>
              ) : (
                <>
                  {/* Email Section */}
                  <div
                    className="p-4 p-md-5 rounded-4 bg-white"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="pr-section-eyebrow">PRIMARY CHANNEL</span>
                    </div>
                    <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--pr-text-dark)' }}>
                      📧 Email Notifications
                    </h2>
                    <p className="text-muted small mb-4">
                      Price drop notifications are formatted with clean store summaries and delivered via our verified Brevo transactional email engine.
                    </p>

                    <form onSubmit={handleSaveEmail}>
                      <div className="mb-3" style={{ maxWidth: '460px' }}>
                        <label className="form-label small fw-semibold text-muted" htmlFor="pref-email">
                          REGISTERED ALERT EMAIL
                        </label>
                        <input
                          id="pref-email"
                          type="email"
                          className="form-control rounded-3 py-2"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{ border: '1px solid var(--pr-border)' }}
                        />
                      </div>
                      <button type="submit" className="btn btn-pr-primary btn-sm px-4 py-2">
                        Save Email Address
                      </button>
                    </form>
                  </div>

                  {/* Telegram Section */}
                  <div
                    className="p-4 p-md-5 rounded-4 bg-white"
                    style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="pr-section-eyebrow">INSTANT BOT CHANNEL</span>
                      {telegramLinked ? (
                        <span className="badge rounded-pill pr-badge-live px-2.5 py-1">
                          ● Connected
                        </span>
                      ) : (
                        <span className="badge rounded-pill bg-secondary-subtle text-secondary px-2.5 py-1">
                          Not Connected
                        </span>
                      )}
                    </div>
                    <h2 className="h5 fw-bold mb-3" style={{ color: 'var(--pr-text-dark)' }}>
                      ✈️ Telegram Notifications
                    </h2>

                    {telegramLinked ? (
                      <div
                        className="p-4 rounded-3"
                        style={{ background: 'var(--pr-mint-bg)', border: '1px solid var(--pr-border)' }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span style={{ fontSize: '1.25rem' }}>✅</span>
                          <span className="fw-bold" style={{ color: 'var(--pr-forest)' }}>
                            Connected to @PriceRadar_Alerts_Bot
                          </span>
                        </div>
                        {telegramChatId && (
                          <p className="small text-muted font-monospace mb-2">
                            Chat ID: {telegramChatId}
                          </p>
                        )}
                        <p className="small text-muted mb-3">
                          Your Telegram account is paired. You can select Telegram when setting up or modifying price alerts.
                        </p>
                        <button
                          type="button"
                          className="btn btn-link text-danger text-decoration-none small p-0 fw-semibold"
                          onClick={handleDisconnect}
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Disconnecting…' : 'Disconnect Telegram'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted small mb-4">
                          Receive instant, zero-latency price drop notifications in Telegram via <strong>@PriceRadar_Alerts_Bot</strong>.
                        </p>

                        {!linkData ? (
                          <button
                            type="button"
                            className="btn btn-pr-primary px-4 py-2"
                            onClick={handleStartConnect}
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Generating Link…' : 'Connect Telegram →'}
                          </button>
                        ) : (
                          <div
                            className="p-4 rounded-3"
                            style={{ background: 'var(--pr-bg-soft)', border: '1px solid var(--pr-border)' }}
                          >
                            <h3 className="h6 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                              Step 1: Open Bot &amp; Press Start
                            </h3>
                            <p className="small text-muted mb-3">
                              Click the button below to launch Telegram and tap <strong>Start</strong>. Your pairing code is attached automatically:
                            </p>
                            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                              <a
                                href={linkData.botDeepLink || `https://t.me/${linkData.botUsername}?start=${linkData.linkCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-pr-primary px-3 py-2"
                              >
                                Open @{linkData.botUsername} in Telegram ↗
                              </a>
                              <span className="small text-muted">
                                Pairing code: <strong className="font-monospace text-dark fs-6">{linkData.linkCode}</strong>
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-2 small text-muted mb-3">
                              <div className="spinner-grow spinner-grow-sm" style={{ color: 'var(--pr-forest)' }} role="status" />
                              <span>Waiting for you to click Start in Telegram…</span>
                            </div>

                            <hr className="my-3" />

                            <form onSubmit={handleManualLink}>
                              <label className="form-label small text-muted fw-medium" htmlFor="manual-code">
                                Or enter code manually if needed:
                              </label>
                              <div className="input-group input-group-sm" style={{ maxWidth: '320px' }}>
                                <input
                                  id="manual-code"
                                  type="text"
                                  className="form-control font-monospace"
                                  placeholder="6-digit code"
                                  value={manualCode}
                                  onChange={(e) => setManualCode(e.target.value)}
                                />
                                <button type="submit" className="btn btn-pr-secondary" disabled={actionLoading}>
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
          )}
        </div>
      </div>
    </div>
  );
}
