import { Link } from 'react-router-dom';
import RadarLogo from '../components/RadarLogo';

export default function NotFoundPage() {
  return (
    <div className="py-5 text-center my-auto">
      <div className="d-inline-block mb-3">
        <RadarLogo size={44} showWordmark={false} />
      </div>
      <div className="pr-section-eyebrow mb-1">ERROR 404</div>
      <h1 className="display-5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.03em' }}>
        Page not found.
      </h1>
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: '420px', lineHeight: '1.6' }}>
        The page you are looking for doesn&apos;t exist, has been archived, or the link may be outdated.
      </p>
      <div className="d-flex justify-content-center gap-2">
        <Link to="/" className="btn btn-pr-primary px-4 py-2">
          Return to Home →
        </Link>
        <Link to="/search" className="btn btn-pr-outline-forest px-4 py-2">
          Search Products
        </Link>
      </div>
    </div>
  );
}
