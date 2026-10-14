import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <h1 className="display-4 fw-bold text-muted mb-2">404</h1>
      <h2 className="h5 mb-4">Page Not Found</h2>
      <p className="text-muted mb-4">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Return Home
      </Link>
    </div>
  );
}
