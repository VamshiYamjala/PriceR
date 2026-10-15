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
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h5 mb-3">{isEditMode ? 'Edit Price Alert' : 'Create Price Alert'}</h1>

            {offer && (
              <div className="p-3 mb-3 rounded bg-light border">
                <div className="fw-semibold text-dark small text-truncate mb-1">{offer.title}</div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-white text-secondary border text-capitalize">{offer.provider}</span>
                  <span className="fw-bold text-primary">
                    Current Price: ₹{((offer.priceInPaise || 0) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="alert-type">Alert Condition</label>
                <select
                  id="alert-type"
                  className="form-select"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="target_price">Target Price (Notify when price drops to or below ₹X)</option>
                  <option value="fixed_drop">Fixed Drop (Notify when price drops by at least ₹Y)</option>
                </select>
              </div>

              {type === 'target_price' ? (
                <div className="mb-3">
                  <label className="form-label" htmlFor="target-price">Target Price in Rupees (₹)</label>
                  <input
                    id="target-price"
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 15000"
                    required
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                  />
                  {offer && typeof offer.priceInPaise === 'number' && Number(targetPrice) >= offer.priceInPaise / 100 && (
                    <div className="alert alert-info py-2 px-3 mt-2 small mb-0">
                      ⚡ <strong>Immediate Evaluation:</strong> Target price (₹{Number(targetPrice).toLocaleString('en-IN')}) is at or above the current offer price (₹{(offer.priceInPaise / 100).toLocaleString('en-IN')}). An alert notification will be evaluated and delivered immediately upon saving.
                    </div>
                  )}
                </div>
              ) : (
                <div className="mb-3">
                  <label className="form-label" htmlFor="drop-amount">Price Drop in Rupees (₹)</label>
                  <input
                    id="drop-amount"
                    type="number"
                    min="1"
                    className="form-control"
                    placeholder="e.g. 1000"
                    required
                    value={dropAmount}
                    onChange={(e) => setDropAmount(e.target.value)}
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="form-label d-block">Notification Channels</label>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="channel-email"
                    checked={channels.includes('email')}
                    onChange={() => toggleChannel('email')}
                  />
                  <label className="form-check-label" htmlFor="channel-email">Email</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="channel-telegram"
                    checked={channels.includes('telegram')}
                    disabled={!telegramLinked}
                    onChange={() => toggleChannel('telegram')}
                  />
                  <label className="form-check-label" htmlFor="channel-telegram">
                    Telegram
                    {!telegramLinked && (
                      <span className="text-muted ms-2 small">
                        (Not linked — <Link to="/settings/notifications">connect Telegram first</Link>)
                      </span>
                    )}
                  </label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading
                  ? (isEditMode ? 'Updating alert…' : 'Creating alert…')
                  : (isEditMode ? 'Update Alert' : 'Create Alert')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
