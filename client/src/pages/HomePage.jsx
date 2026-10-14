import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="py-5 text-center">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="display-5 fw-bold mb-3" style={{ color: '#0F6E56' }}>
            PriceRadar
          </h1>
          <p className="lead text-muted mb-4">
            Compare prices across major Indian retailers in real time. Set smart price-drop alerts and never miss a deal.
          </p>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="input-group input-group-lg shadow-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Search for Samsung, Redmi, boAt, Noise..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary px-4" type="submit">
                Search
              </button>
            </div>
          </form>
          <div className="text-muted small">
            <span>Popular: </span>
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none"
              onClick={() => navigate('/search?q=Samsung')}
            >
              Samsung M14
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none"
              onClick={() => navigate('/search?q=boAt')}
            >
              boAt Airdopes
            </button>
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none"
              onClick={() => navigate('/search?q=Noise')}
            >
              Noise ColorFit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
