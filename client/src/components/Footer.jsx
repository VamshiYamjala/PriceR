import { Link } from 'react-router-dom';
import RadarLogo from './RadarLogo';

export default function Footer() {
  return (
    <footer className="footer-dark border-top" style={{ borderColor: '#233028' }}>
      <div className="container">
        <div className="row g-4 justify-content-between align-items-center mb-4">
          <div className="col-md-5">
            <Link to="/" className="d-inline-block mb-2">
              <RadarLogo size={28} variant="light" />
            </Link>
            <p className="small mb-0" style={{ color: '#88968D' }}>
              A little research. A better purchase.
            </p>
          </div>

          <div className="col-md-7">
            <div className="d-flex flex-wrap gap-4 justify-content-md-end align-items-center">
              <Link to="/" className="text-decoration-none small text-light opacity-75 opacity-100-hover">
                Explore
              </Link>
              <Link to="/search" className="text-decoration-none small text-light opacity-75 opacity-100-hover">
                Product search
              </Link>
              <Link to="/watchlist" className="text-decoration-none small text-light opacity-75 opacity-100-hover">
                Watchlist
              </Link>
              <Link to="/alerts" className="text-decoration-none small text-light opacity-75 opacity-100-hover">
                Price alerts
              </Link>
              <Link to="/settings/notifications" className="text-decoration-none small text-light opacity-75 opacity-100-hover">
                Settings
              </Link>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: '#26342C', opacity: 0.5 }} className="my-3" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small" style={{ color: '#68776D' }}>
          <div>
            © {new Date().getFullYear()} PriceRadar. Multi-provider real-time price monitoring.
          </div>
          <div className="d-flex align-items-center gap-1 mt-2 mt-sm-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Shop informed. Stay in control.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
