import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RadarLogo from './RadarLogo';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky-top bg-white border-bottom" style={{ borderColor: 'var(--pr-border)' }}>
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-3">
          {/* Brand Logo */}
          <Link to="/" className="text-decoration-none" onClick={closeMenu}>
            <RadarLogo size={30} variant="dark" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `nav-link-pr ${isActive ? 'active' : ''}`}
            >
              Explore
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) => `nav-link-pr ${isActive ? 'active' : ''}`}
            >
              Product search
            </NavLink>
            <NavLink
              to="/watchlist"
              className={({ isActive }) => `nav-link-pr d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>Watchlist</span>
            </NavLink>
            <NavLink
              to="/alerts"
              className={({ isActive }) => `nav-link-pr d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span>Price alerts</span>
            </NavLink>
            <NavLink
              to="/diagnostics"
              className={({ isActive }) => `nav-link-pr d-flex align-items-center gap-1 ${isActive ? 'active' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span>Diagnostics</span>
            </NavLink>
          </nav>

          {/* Desktop Right Actions */}
          <div className="d-none d-lg-flex align-items-center gap-3">
            {/* Notifications icon button */}
            <Link
              to="/notifications"
              className="btn btn-link p-1 text-dark text-decoration-none"
              title="Notification Delivery Log"
              aria-label="Notification history"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </Link>

            {isAuthenticated ? (
              <div className="d-flex align-items-center gap-2">
                <Link to="/dashboard" className="btn btn-outline-forest btn-sm">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-muted text-decoration-none"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-3">
                <Link to="/login" className="text-dark fw-medium small text-decoration-none">
                  Log in
                </Link>
                <Link to="/register" className="btn-forest btn-sm">
                  <span>Get started</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="d-lg-none btn btn-link text-dark p-1 border-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="d-lg-none py-3 border-top" style={{ borderColor: 'var(--pr-border)' }}>
            <div className="d-flex flex-column gap-2 mb-3">
              <NavLink to="/" end className="sidebar-nav-link" onClick={closeMenu}>
                Explore
              </NavLink>
              <NavLink to="/search" className="sidebar-nav-link" onClick={closeMenu}>
                Product search
              </NavLink>
              <NavLink to="/watchlist" className="sidebar-nav-link" onClick={closeMenu}>
                Watchlist
              </NavLink>
              <NavLink to="/alerts" className="sidebar-nav-link" onClick={closeMenu}>
                Price alerts
              </NavLink>
              <NavLink to="/notifications" className="sidebar-nav-link" onClick={closeMenu}>
                Notifications
              </NavLink>
              <NavLink to="/diagnostics" className="sidebar-nav-link" onClick={closeMenu}>
                Diagnostics
              </NavLink>
              {isAuthenticated && (
                <NavLink to="/dashboard" className="sidebar-nav-link" onClick={closeMenu}>
                  Dashboard
                </NavLink>
              )}
            </div>
            <div className="pt-2 border-top">
              {isAuthenticated ? (
                <div className="d-flex justify-content-between align-items-center">
                  <span className="small text-muted">{user?.name || user?.email}</span>
                  <button className="btn btn-outline-forest btn-sm" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-forest flex-grow-1" onClick={closeMenu}>
                    Log in
                  </Link>
                  <Link to="/register" className="btn-forest flex-grow-1" onClick={closeMenu}>
                    Get started →
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
