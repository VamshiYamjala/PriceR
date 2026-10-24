import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import * as api from '../services/api';

export default function AlertFormPage() {
  const { alertId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEditMode = Boolean(alertId);
  const offerId = searchParams.get('offerId') || '';

  const [offer, setOffer] = useState(null);
  const [type, setType] = useState('target_price');
  const [targetPrice, setTargetPrice] = useState('');
  const [dropAmount, setDropAmount] = useState('');
  const [channels, setChannels] = useState(['email']);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        if (isEditMode) {
          const data = await api.getAlerts();
          const alert = data?.alerts?.find((a) => a.id === alertId);
          if (alert) {
            setType(alert.type);
            if (alert.targetPriceInPaise) {
              setTargetPrice(String(alert.targetPriceInPaise / 100));
            }
            if (alert.dropAmountInPaise) {
              setDropAmount(String(alert.dropAmountInPaise / 100));
            }
            if (Array.isArray(alert.channels)) {
              setChannels(alert.channels);
            }
            if (alert.offer) {
              setOffer(alert.offer);
            } else if (alert.offerId) {
              try {
                const offRes = await api.getOffer(alert.offerId);
                setOffer(offRes.offer);
              } catch (_) {}
            }
          } else {
            setError('Alert not found.');
          }
        } else if (offerId) {
          try {
            const offRes = await api.getOffer(offerId);
            setOffer(offRes.offer);
          } catch (_) {}
        }
      } catch (err) {
        setError('Failed to load alert details.');
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [isEditMode, alertId, offerId]);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const prefs = await api.getNotificationPreferences();
        setTelegramLinked(Boolean(prefs?.telegramLinked));
      } catch {
        // Fallback: leave telegramLinked false
      }
    }
    loadPreferences();
  }, []);

  function toggleChannel(channel) {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (channels.length === 0) {
      setError('Please select at least one notification channel.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isEditMode) {
        await api.updateAlert(alertId, {
          type,
          targetPriceInPaise: type === 'target_price' ? Math.round(Number(targetPrice) * 100) : undefined,
          dropAmountInPaise: type === 'fixed_drop' ? Math.round(Number(dropAmount) * 100) : undefined,
          channels,
        });
      } else {
        await api.createAlert({
          offerId,
          type,
          targetPriceInPaise: type === 'target_price' ? Math.round(Number(targetPrice) * 100) : undefined,
          dropAmountInPaise: type === 'fixed_drop' ? Math.round(Number(dropAmount) * 100) : undefined,
          channels,
        });
      }
      navigate('/alerts');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save alert rule.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" style={{ color: 'var(--pr-forest)' }} role="status">
          <span className="visually-hidden">Loading alert…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
        <div className="mb-3">
          <Link to="/alerts" className="text-decoration-none small fw-semibold" style={{ color: 'var(--pr-forest)' }}>
            ← Back to Price Alerts
          </Link>
        </div>

        <div
          className="card border-0 rounded-4 bg-white"
          style={{ border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}
        >
          <div className="card-body p-4 p-md-5">
            <span className="pr-section-eyebrow d-block mb-1">CONFIGURATION</span>
            <h1 className="h4 fw-bold mb-3" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
              {isEditMode ? 'Edit Price Alert' : 'Create Price Alert'}
            </h1>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-4" role="alert">
                {error}
              </div>
            )}

            {offer && (
              <div
                className="p-3 mb-4 rounded-3 d-flex align-items-center gap-3"
                style={{ background: 'var(--pr-mint-bg)', border: '1px solid var(--pr-border)' }}
              >
                {offer.imageUrl && (
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center p-2 flex-shrink-0"
                    style={{ width: '60px', height: '60px', background: 'white' }}
                  >
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div className="flex-grow-1 overflow-hidden">
                  <div className="fw-semibold small text-truncate mb-1" style={{ color: 'var(--pr-text-dark)' }}>
                    {offer.title}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span
                      className="badge text-uppercase tracking-wider fw-semibold px-2 py-0.5 rounded-pill"
                      style={{ background: 'white', color: 'var(--pr-forest)', fontSize: '0.7rem' }}
                    >
                      {offer.provider}
                    </span>
                    <span className="fw-bold" style={{ color: 'var(--pr-forest)' }}>
                      Current: ₹{((offer.priceInPaise || 0) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted" htmlFor="alert-type">
                  ALERT CONDITION
                </label>
                <select
                  id="alert-type"
                  className="form-select rounded-3 py-2"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  style={{ border: '1px solid var(--pr-border)', color: 'var(--pr-text-dark)' }}
                >
                  <option value="target_price">Target Price (Notify when price drops to or below ₹X)</option>
                  <option value="fixed_drop">Fixed Drop (Notify when price drops by at least ₹Y)</option>
                </select>
              </div>

              {type === 'target_price' ? (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted" htmlFor="target-price">
                    TARGET PRICE (₹)
                  </label>
                  <input
                    id="target-price"
                    type="number"
                    min="1"
                    className="form-control rounded-3 py-2"
                    placeholder="e.g. 15000"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    style={{ border: '1px solid var(--pr-border)' }}
                  />
                  {offer && typeof offer.priceInPaise === 'number' && Number(targetPrice) >= offer.priceInPaise / 100 && (
                    <div
                      className="p-2.5 mt-2 rounded-3 small"
                      style={{ background: 'var(--pr-mint-bg)', border: '1px solid var(--pr-border)', color: 'var(--pr-forest)' }}
                    >
                      ⚡ <strong>Immediate Evaluation:</strong> Target price (₹{Number(targetPrice).toLocaleString('en-IN')}) is at or above the current offer price (₹{(offer.priceInPaise / 100).toLocaleString('en-IN')}). An alert notification will trigger and deliver immediately upon saving.
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted" htmlFor="drop-amount">
                    PRICE DROP AMOUNT (₹)
                  </label>
                  <input
                    id="drop-amount"
                    type="number"
                    min="1"
                    className="form-control rounded-3 py-2"
                    placeholder="e.g. 1000"
                    required
                    value={dropAmount}
                    onChange={(e) => setDropAmount(e.target.value)}
                    style={{ border: '1px solid var(--pr-border)' }}
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted d-block mb-2">
                  DELIVERY CHANNELS
                </label>
                <div className="d-flex flex-wrap gap-3">
                  <label
                    className="d-flex align-items-center gap-2 p-2.5 rounded-3 border flex-grow-1 cursor-pointer"
                    style={{
                      background: channels.includes('email') ? 'var(--pr-mint-bg)' : '#FFFFFF',
                      borderColor: channels.includes('email') ? 'var(--pr-forest)' : 'var(--pr-border)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="channel-email"
                      checked={channels.includes('email')}
                      onChange={() => toggleChannel('email')}
                      style={{ accentColor: 'var(--pr-forest)' }}
                    />
                    <span className="small fw-semibold" style={{ color: 'var(--pr-text-dark)' }}>
                      📧 Email
                    </span>
                  </label>

                  <label
                    className="d-flex align-items-center gap-2 p-2.5 rounded-3 border flex-grow-1 cursor-pointer"
                    style={{
                      background: channels.includes('telegram') ? 'var(--pr-mint-bg)' : '#FFFFFF',
                      borderColor: channels.includes('telegram') ? 'var(--pr-forest)' : 'var(--pr-border)',
                      cursor: telegramLinked ? 'pointer' : 'not-allowed',
                      opacity: telegramLinked ? 1 : 0.6,
                    }}
                  >
                    <input
                      type="checkbox"
                      id="channel-telegram"
                      checked={channels.includes('telegram')}
                      disabled={!telegramLinked}
                      onChange={() => toggleChannel('telegram')}
                      style={{ accentColor: 'var(--pr-forest)' }}
                    />
                    <span className="small fw-semibold" style={{ color: 'var(--pr-text-dark)' }}>
                      ✈️ Telegram
                    </span>
                  </label>
                </div>
                {!telegramLinked && (
                  <div className="text-muted small mt-2">
                    Telegram is not connected yet. You can <Link to="/settings/notifications" style={{ color: 'var(--pr-forest)' }}>link your bot in Settings</Link>.
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-pr-primary w-100 py-2.5" disabled={loading}>
                {loading
                  ? (isEditMode ? 'Updating alert…' : 'Creating alert…')
                  : (isEditMode ? 'Update Alert →' : 'Create Alert →')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
