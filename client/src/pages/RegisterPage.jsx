import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import RadarLogo from '../components/RadarLogo';

export default function RegisterPage() {
  const { setAuthSession } = useAuth();
  const navigate = useNavigate();

  // Registration step: 'form' | 'otp'
  const [step, setStep] = useState('form');

  // Step 1 Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2 OTP state
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & error states
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle Step 1: Initiate registration and send OTP
  async function handleInitiate(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await api.initiateRegistration({ name, email, password });
      setStep('otp');
      setResendCooldown(res?.resendCooldownSeconds || 60);
      setInfoMessage(`A 6-digit verification code was sent to ${email}. Please check your Inbox, Spam, or Promotions tab.`);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to server. Please verify your internet connection or try again shortly.'
          : 'Registration failed. Please check your information and try again.');
      setError(msg);
      // Remain on form step so user can review details and retry
    } finally {
      setLoading(false);
    }
  }

  // Handle Step 2: Verify OTP and log in
  async function handleVerify(e) {
    e.preventDefault();
    if (loading) return;
    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const data = await api.verifyRegistration({ email, otp: otp.trim() });
      if (data?.token && data?.user) {
        setAuthSession(data.token, data.user);
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('Invalid verification response from server.');
      }
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Network connection error. Please try again.'
          : 'Verification failed. Please check the code and try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Handle Resend OTP
  async function handleResend() {
    if (loading || resendCooldown > 0) return;
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await api.resendRegistrationOtp({ email });
      setResendCooldown(res?.resendCooldownSeconds || 60);
      setInfoMessage('A fresh verification code has been dispatched. Please check your Inbox, Spam, or Promotions tab.');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to resend code. Please wait a moment and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-7 col-lg-5" style={{ maxWidth: '440px' }}>
        <div
          className="card border-0 rounded-4 bg-white"
          style={{
            border: '1px solid var(--pr-border)',
            borderTop: '4px solid var(--pr-forest)',
            boxShadow: 'var(--pr-card-shadow)',
          }}
        >
          <div className="card-body p-4 p-sm-5">
            <div className="text-center mb-3">
              <div className="d-inline-block mb-2">
                <RadarLogo size={32} showWordmark={true} />
              </div>
              <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
                {step === 'form' ? 'Start shopping smarter.' : 'Verify your email.'}
              </h1>
              <p className="text-muted small mb-0">
                {step === 'form'
                  ? 'Create your free PriceRadar account.'
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
                {error}
              </div>
            )}

            {infoMessage && (
              <div
                className="alert py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2"
                style={{ background: 'var(--pr-mint-bg)', border: '1px solid var(--pr-border)', color: 'var(--pr-forest)' }}
                role="status"
              >
                <span>✉️</span>
                <span>{infoMessage}</span>
              </div>
            )}

            {step === 'form' ? (
              /* STEP 1: Registration Credentials Form */
              <form onSubmit={handleInitiate} noValidate={false}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted" htmlFor="register-name">
                    FULL NAME
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    className="form-control rounded-3 py-2"
                    placeholder="e.g. Maya Patel"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ border: '1px solid var(--pr-border)', fontSize: '0.95rem' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted" htmlFor="register-email">
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    className="form-control rounded-3 py-2"
                    placeholder="name@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ border: '1px solid var(--pr-border)', fontSize: '0.95rem' }}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted" htmlFor="register-password">
                    PASSWORD (MIN 8 CHARS)
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    className="form-control rounded-3 py-2"
                    placeholder="••••••••"
                    minLength={8}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ border: '1px solid var(--pr-border)', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  id="register-submit-btn"
                  className="btn w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: 'var(--pr-forest)',
                    color: '#FFFFFF',
                    border: '1px solid var(--pr-forest)',
                    borderRadius: '10px',
                    minHeight: '44px',
                    fontSize: '0.95rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.75 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Sending verification code…</span>
                    </>
                  ) : (
                    <span>Send Verification Code →</span>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: Email OTP Verification Card */
              <form onSubmit={handleVerify} noValidate={false}>
                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted text-center d-block" htmlFor="register-otp">
                    6-DIGIT VERIFICATION CODE
                  </label>
                  <input
                    id="register-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    autoComplete="one-time-code"
                    className="form-control rounded-3 py-2 text-center fw-bold"
                    placeholder="• • • • • •"
                    required
                    value={otp}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(digits);
                    }}
                    style={{
                      border: '2px solid var(--pr-forest)',
                      fontSize: '1.75rem',
                      letterSpacing: '0.4em',
                      backgroundColor: 'var(--pr-bg-soft)',
                      fontFamily: "'SFMono-Regular', Consolas, monospace",
                    }}
                  />
                  <div className="form-text text-center text-muted small mt-2">
                    Code expires in 10 minutes. If not in your inbox, please check your Spam or Promotions tab.
                  </div>
                  <div className="text-center text-secondary small mt-1" style={{ fontSize: '0.8rem' }}>
                    Note: Email delivery typically takes a few seconds, but may take 1–2 minutes depending on your mail provider.
                  </div>
                </div>

                <button
                  type="submit"
                  id="register-verify-btn"
                  className="btn w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                  style={{
                    backgroundColor: 'var(--pr-forest)',
                    color: '#FFFFFF',
                    border: '1px solid var(--pr-forest)',
                    borderRadius: '10px',
                    minHeight: '44px',
                    fontSize: '0.95rem',
                    cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer',
                    opacity: loading || otp.length < 6 ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  disabled={loading || otp.length < 6}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Confirming code…</span>
                    </>
                  ) : (
                    <span>Confirm & Create Account →</span>
                  )}
                </button>

                <div className="d-flex justify-content-between align-items-center small pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none small"
                    onClick={() => {
                      setStep('form');
                      setError(null);
                      setInfoMessage(null);
                      setOtp('');
                    }}
                    style={{ color: 'var(--pr-text-muted)' }}
                  >
                    ← Edit details
                  </button>

                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none small fw-semibold"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    style={{
                      color: resendCooldown > 0 ? 'var(--pr-text-muted)' : 'var(--pr-forest)',
                      cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    }}
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-3 pt-3 border-top small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
