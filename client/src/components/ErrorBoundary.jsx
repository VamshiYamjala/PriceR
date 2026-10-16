import React from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/search';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center">
          <div
            className="p-5 rounded-4 bg-white mx-auto"
            style={{
              maxWidth: '560px',
              border: '1px solid var(--pr-border)',
              boxShadow: 'var(--pr-card-shadow)',
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: '56px', height: '56px', backgroundColor: 'var(--pr-mint-bg)', color: 'var(--pr-forest)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="h5 fw-bold mb-2" style={{ color: 'var(--pr-text-dark)' }}>
              Display Notice
            </h2>
            <p className="text-muted small mb-4">
              We encountered a display issue while rendering this section. Your tracked items and alerts remain safe.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <button
                type="button"
                className="btn btn-pr-primary px-3 py-2 btn-sm"
                onClick={this.handleReset}
              >
                Refresh Search
              </button>
              <Link to="/" className="btn btn-pr-outline-forest px-3 py-2 btn-sm">
                Return Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
