import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as api from '../services/api';

export default function AlertFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const offerId = searchParams.get('offerId') || '';
  const [type, setType] = useState('target_price');
  const [targetPrice, setTargetPrice] = useState('');
  const [dropAmount, setDropAmount] = useState('');
  const [channels, setChannels] = useState(['email']);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      await api.createAlert({
        offerId,
        type,
        targetPriceInPaise: type === 'target_price' ? Math.round(Number(targetPrice) * 100) : undefined,
        dropAmountInPaise: type === 'fixed_drop' ? Math.round(Number(dropAmount) * 100) : undefined,
        channels,
      });
      navigate('/alerts');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save alert rule.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center py-3">
      <div className="col-md-7 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h1 className="h5 mb-3">Create Price Alert</h1>

            {error && <div className="alert alert-danger py-2">{error}</div>}

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
                    onChange={() => toggleChannel('telegram')}
                  />
                  <label className="form-check-label" htmlFor="channel-telegram">Telegram</label>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                {loading ? 'Creating alert…' : 'Create Alert'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
