import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RadarLogo from '../components/RadarLogo';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, email, password });
      await login({ email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row justify-content-center py-5">
      <div className="col-12 col-sm-10 col-md-7 col-lg-5" style={{ maxWidth: '440px' }}>
        <div
          className="card border-0 rounded-4 bg-white"
          style={{
            border: '1px solid var(--pr-border)',
            borderTop: '4px solid var(--pr-forest)',
            boxShadow: 'var(--pr-card-shadow)',
          }}
        >
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <div className="d-inline-block mb-3">
                <RadarLogo size={32} showWordmark={true} />
              </div>
              <h1 className="h4 fw-bold mb-1" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
                Start shopping smarter.
              </h1>
              <p className="text-muted small mb-0">
                Create your free PriceRadar account.
              </p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ border: '1px solid var(--pr-border)' }}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ border: '1px solid var(--pr-border)' }}
                />
              </div>

              <div className="mb-4">
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ border: '1px solid var(--pr-border)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-pr-primary w-100 py-2.5 fw-semibold"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>

            <div className="text-center mt-4 pt-2 border-top small text-muted">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: 'var(--pr-forest)' }}>
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
