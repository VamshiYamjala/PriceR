import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" style={{ color: '#0F6E56' }}>
          PriceRadar
        </Link>
        <div className="d-flex gap-3 align-items-center">
          <Link to="/search" className="nav-link d-inline">
            Search
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link d-inline">
                Dashboard
              </Link>
              <Link to="/watchlist" className="nav-link d-inline">
                Watchlist
              </Link>
              <Link to="/alerts" className="nav-link d-inline">
                Alerts
              </Link>
              <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link d-inline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
