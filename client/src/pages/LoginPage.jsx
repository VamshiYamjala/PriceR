import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RadarLogo from '../components/RadarLogo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const redirectMessage = location.state?.message;
  const from = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        (err.code === 'ERR_NETWORK'
          ? 'Cannot connect to backend server. Please ensure the backend is running on port 5000 and MongoDB Atlas is reachable.'
          : 'Login failed. Please check your credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center py-4">
      <div className="col-12 col-sm-10 col-md-7 col-lg-5" style={{ maxWidth: '420px' }}>
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
                Welcome back.
              </h1>
              <p className="text-muted small mb-0">
                Sign in to your PriceRadar account.
              </p>
            </div>

            {redirectMessage && (
              <div className="alert alert-info py-2 px-3 small rounded-3 mb-3" role="alert">
                {redirectMessage}
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate={false}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted" htmlFor="login-email">
                  EMAIL ADDRESS
                </label>
                <input
                  id="login-email"
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
                <label className="form-label small fw-semibold text-muted" htmlFor="login-password">
                  PASSWORD
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="form-control rounded-3 py-2"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ border: '1px solid var(--pr-border)', fontSize: '0.95rem' }}
                />
              </div>

              <button
                type="submit"
                id="login-submit-btn"
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
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Sign In →</span>
                )}
              </button>
            </form>

            <div className="text-center mt-3 pt-3 border-top small text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
