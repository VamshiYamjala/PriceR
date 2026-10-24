import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RadarLogo from '../components/RadarLogo';
import { forgotPassword, verifyResetOtp, resendResetOtp, resetPassword } from '../services/api';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Step state: 'request' | 'verify' | 'reset' | 'success'
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Resend cooldown timer in seconds
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Step 1: Request OTP
  async function handleRequestOtp(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setSuccessMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword({ email: trimmedEmail });
      setSuccessMsg(res.message || 'If an account matches this email, a 6-digit code has been sent.');
      setCooldown(60);
      setStep('verify');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Unable to process your request. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    const cleanOtp = otp.trim().replace(/\s+/g, '');
    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyResetOtp({ email: email.trim().toLowerCase(), otp: cleanOtp });
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setStep('reset');
        setError(null);
      } else {
        setError('Verification succeeded, but no reset token was received.');
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'The code entered is invalid or expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (cooldown > 0 || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await resendResetOtp({ email: email.trim().toLowerCase() });
      setSuccessMsg(res.message || 'A fresh verification code has been dispatched.');
      setCooldown(60);
      setOtp('');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to resend verification code. Please wait and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Set New Password
  async function handleResetPassword(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        email: email.trim().toLowerCase(),
        resetToken,
        newPassword,
      });
      setStep('success');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Password reset failed. Please restart the verification process.';
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
            <div className="card-body p-4">
              <div className="text-center mb-3">
                <div className="d-inline-block mb-2">
                  <RadarLogo size={32} showWordmark={true} />
                </div>
                <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
                  {step === 'request' && 'Reset your password'}
                  {step === 'verify' && 'Verify reset code'}
                  {step === 'reset' && 'Create new password'}
                  {step === 'success' && 'Password updated!'}
                </h1>
                <p className="text-muted small mb-0">
                  {step === 'request' && 'Enter your email to receive a 6-digit verification code.'}
                  {step === 'verify' && `We sent a 6-digit code to ${email}. Valid for 10 minutes.`}
                  {step === 'reset' && 'Choose a strong password with at least 8 characters.'}
                  {step === 'success' && 'Your password has been securely updated.'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {successMsg && step === 'verify' && (
                <div className="alert alert-success py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2" role="alert">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Step 1: Request OTP Form */}
              {step === 'request' && (
                <form onSubmit={handleRequestOtp} noValidate={false}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted" htmlFor="forgot-email">
                      EMAIL ADDRESS
                    </label>
                    <input
                      id="forgot-email"
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

                  <button
                    type="submit"
                    id="request-reset-btn"
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
              )}

              {/* Step 2: Verify OTP Form */}
              {step === 'verify' && (
                <form onSubmit={handleVerifyOtp} noValidate={false}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted" htmlFor="reset-otp">
                      6-DIGIT VERIFICATION CODE
                    </label>
                    <input
                      id="reset-otp"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      className="form-control text-center rounded-3 py-2 fw-bold"
                      placeholder="••••••"
                      required
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{
                        border: '1px solid var(--pr-border)',
                        fontSize: '1.25rem',
                        letterSpacing: '0.4em',
                      }}
                    />
                    <div className="form-text small text-muted text-center mt-2">
                      Please enter the code sent to your registered email address.
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="verify-otp-btn"
                    className="btn w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mb-3"
                    style={{
                      backgroundColor: 'var(--pr-forest)',
                      color: '#FFFFFF',
                      border: '1px solid var(--pr-forest)',
                      borderRadius: '10px',
                      minHeight: '44px',
                      fontSize: '0.95rem',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.75 : 1,
                    }}
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Verifying…</span>
                      </>
                    ) : (
                      <span>Verify Code →</span>
                    )}
                  </button>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-muted p-0 text-decoration-none"
                      onClick={() => {
                        setStep('request');
                        setOtp('');
                        setError(null);
                      }}
                    >
                      ← Change email
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold"
                      style={{ color: cooldown > 0 ? 'var(--pr-text-muted)' : 'var(--pr-forest)' }}
                      onClick={handleResendOtp}
                      disabled={cooldown > 0 || loading}
                    >
                      {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: Create New Password Form */}
              {step === 'reset' && (
                <form onSubmit={handleResetPassword} noValidate={false}>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted" htmlFor="new-password">
                      NEW PASSWORD
                    </label>
                    <div className="input-group">
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        className="form-control rounded-start-3 py-2"
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ border: '1px solid var(--pr-border)', fontSize: '0.95rem' }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-3"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ borderColor: 'var(--pr-border)' }}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-muted" htmlFor="confirm-password">
                      CONFIRM NEW PASSWORD
                    </label>
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-control rounded-3 py-2"
                      placeholder="Re-enter password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ border: '1px solid var(--pr-border)', fontSize: '0.95rem' }}
                    />
                  </div>

                  {newPassword && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between small text-muted mb-1">
                        <span>Password strength</span>
                        <span className="fw-semibold">
                          {newPassword.length < 8 ? 'Too short' : newPassword.length < 12 ? 'Moderate' : 'Strong'}
                        </span>
                      </div>
                      <div className="progress" style={{ height: '4px' }}>
                        <div
                          className={`progress-bar ${
                            newPassword.length < 8 ? 'bg-danger' : newPassword.length < 12 ? 'bg-warning' : 'bg-success'
                          }`}
                          role="progressbar"
                          style={{
                            width: `${Math.min(100, Math.max(15, (newPassword.length / 12) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    id="submit-new-password-btn"
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
                    }}
                    disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Updating password…</span>
                      </>
                    ) : (
                      <span>Update Password →</span>
                    )}
                  </button>
                </form>
              )}

              {/* Step 4: Success confirmation screen */}
              {step === 'success' && (
                <div className="text-center py-3">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: '56px', height: '56px', backgroundColor: '#EAF2E6', color: 'var(--pr-forest)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
                    Password successfully changed
                  </h2>
                  <p className="text-muted small mb-4">
                    Your password has been securely reset. You can now log into your PriceRadar account using your new credentials.
                  </p>
                  <button
                    type="button"
                    className="btn btn-forest w-100 py-2"
                    onClick={() => navigate('/login', { replace: true, state: { message: 'Password reset successful. Please sign in.' } })}
                  >
                    Sign In Now →
                  </button>
                </div>
              )}

              {step !== 'success' && (
                <div className="text-center mt-3 pt-3 border-top small text-muted">
                  Remember your password?{' '}
                  <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                    Back to sign in
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
