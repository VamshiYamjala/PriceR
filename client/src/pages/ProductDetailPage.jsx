import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/api';
import OfferRow from '../components/OfferRow';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [historyByOffer, setHistoryByOffer] = useState({});
  const [activeHistoryOffer, setActiveHistoryOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(productId);
        const prod = data?.product || data;
        const offerList = data?.offers || data?.product?.offers || [];
        setProduct(prod);
        setOffers(offerList);

        // Load price history for the first available offer with an id
        const tracked = offerList.find((o) => o.id || o._id);
        if (tracked) {
          setActiveHistoryOffer(tracked.id);
          try {
            const histData = await api.getOfferHistory(tracked.id);
            setHistoryByOffer((prev) => ({
              ...prev,
              [tracked.id]: histData?.history || [],
            }));
          } catch (histErr) {
            console.warn('[detail] Price history not available:', histErr.message);
          }
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  async function loadOfferHistory(offerId) {
    setActiveHistoryOffer(offerId);
    if (!historyByOffer[offerId]) {
      try {
        const histData = await api.getOfferHistory(offerId);
        setHistoryByOffer((prev) => ({
          ...prev,
          [offerId]: histData?.history || [],
        }));
      } catch (err) {
        setHistoryByOffer((prev) => ({ ...prev, [offerId]: [] }));
      }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading product…</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="alert alert-danger my-4 shadow-sm">
        <h5>Error loading product</h5>
        <p>{error || 'Product details are unavailable.'}</p>
        <Link to="/search" className="btn btn-outline-danger btn-sm">
          Back to Search
        </Link>
      </div>
    );
  }

  const validOffers = offers.filter(
    (o) => o.availability !== 'out_of_stock' && o.lastStatus !== 'error'
  );
  const lowestOfferId =
    validOffers.length > 0
      ? validOffers.reduce((min, o) => (o.priceInPaise < min.priceInPaise ? o : min)).id
      : null;

  const isSampleProduct =
    product.dataStatus === 'sample' ||
    product.isSample ||
    offers.every((o) => o.isSample || o.dataStatus === 'sample');

  const activeHistory = activeHistoryOffer ? historyByOffer[activeHistoryOffer] : null;

  return (
    <div className="py-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/search">Search</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.title}</li>
        </ol>
      </nav>

      {/* Honest Data Status Notice */}
      {isSampleProduct && (
        <div
          className="d-flex align-items-center gap-3 p-3 mb-4 rounded-3 text-muted small"
          style={{ background: 'var(--pr-mint-bg)', border: '1px solid var(--pr-border)' }}
        >
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          <span>
            <strong style={{ color: 'var(--pr-forest)' }}>Sample Demonstration Listing:</strong> This item is sourced from our demonstration catalog ({product.sourceProvider || 'sample catalog'}). Genuine live market comparisons and price alerts are enabled for verified retailer feeds.
          </span>
        </div>
      )}

      {/* Main Product Card */}
      <div className="card border-0 mb-4 rounded-4" style={{ background: '#FFFFFF', border: '1px solid var(--pr-border)', boxShadow: 'var(--pr-card-shadow)' }}>
        <div className="card-body p-4 p-md-5">
          <div className="d-flex flex-column flex-md-row gap-4 align-items-md-start mb-4 pb-4 border-bottom">
            {product.imageUrl && (
              <div
                className="d-flex align-items-center justify-content-center rounded-3 p-3 align-self-center align-self-md-start"
                style={{
                  width: '200px',
                  height: '200px',
                  minWidth: '200px',
                  background: 'var(--pr-image-bg)',
                  border: '1px solid var(--pr-border)',
                }}
              >
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            <div className="flex-grow-1">
              <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                {product.category && (
                  <span
                    className="badge text-uppercase tracking-wider fw-semibold px-2 py-1 rounded-pill"
                    style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.72rem' }}
                  >
                    {product.category}
                  </span>
                )}
                {isSampleProduct ? (
                  <span className="badge pr-badge-sample rounded-pill px-2 py-1">Sample Catalog</span>
                ) : (
                  <span className="badge pr-badge-live rounded-pill px-2 py-1">Verified Retailer</span>
                )}
              </div>

              <h1 className="h3 mb-2 fw-bold" style={{ color: 'var(--pr-text-dark)', letterSpacing: '-0.02em' }}>
                {product.title}
              </h1>

              {(product.brand || product.model || product.variant) && (
                <p className="text-muted small mb-3">
                  {[product.brand, product.model, product.variant].filter(Boolean).join(' · ')}
                </p>
              )}

              {product.description && (
                <p className="text-muted small mb-0" style={{ maxWidth: '720px', lineHeight: '1.6' }}>
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Offers Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span className="pr-section-eyebrow d-block mb-1">MARKET OVERVIEW</span>
                <h2 className="h5 fw-bold mb-0" style={{ color: 'var(--pr-text-dark)' }}>
                  Available Store Offers &amp; Comparison
                </h2>
              </div>
              <span className="badge rounded-pill px-3 py-1" style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.8rem' }}>
                {offers.length} offer{offers.length === 1 ? '' : 's'}
              </span>
            </div>

            {offers.length === 0 ? (
              <div
                className="p-4 rounded-3 text-center text-muted small"
                style={{ background: 'var(--pr-bg-soft)', border: '1px dashed var(--pr-border)' }}
              >
                No store offers currently available for this product.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {offers.map((offer) => (
                  <div key={offer.id || offer._id}>
                    <OfferRow
                      offer={offer}
                      isLowest={(offer.id || offer._id) === lowestOfferId}
                    />
                    {offer.id &&
                      !offer.id.startsWith('dummyjson-') &&
                      !offer.id.startsWith('mockshop-') && (
                        <div className="mt-1 text-end">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-decoration-none small py-0 fw-semibold"
                            style={{ color: 'var(--pr-forest)', fontSize: '0.8rem' }}
                            onClick={() => loadOfferHistory(offer.id || offer._id)}
                          >
                            📈 {activeHistoryOffer === (offer.id || offer._id) ? 'Viewing Price History' : 'View Price History'}
                          </button>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Genuine Stored Observations History with Trend Chart */}
          {activeHistoryOffer && (
            <div className="mt-5 pt-4 border-top">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <span className="pr-section-eyebrow d-block mb-1">PRICE INTELLIGENCE</span>
                  <h3 className="h5 fw-bold mb-0" style={{ color: 'var(--pr-text-dark)' }}>
                    Verified Observation History &amp; Trend
                  </h3>
                </div>
                <span className="badge rounded-pill px-3 py-1" style={{ background: 'var(--pr-mint-bg)', color: 'var(--pr-forest)', fontSize: '0.8rem' }}>
                  {activeHistory ? activeHistory.length : 0} observation{activeHistory?.length === 1 ? '' : 's'}
                </span>
              </div>

              {activeHistory && activeHistory.length > 0 ? (
                <div>
                  {/* Min / Max Summary Stats */}
                  {(() => {
                    const validPrices = activeHistory
                      .filter((h) => h.status === 'success' && typeof h.priceInPaise === 'number')
                      .map((h) => h.priceInPaise);

                    if (validPrices.length === 0) return null;
                    const minPrice = Math.min(...validPrices);
                    const maxPrice = Math.max(...validPrices);
                    const latestPrice = validPrices[0];

                    return (
                      <div className="row g-3 mb-4">
                        <div className="col-sm-4">
                          <div
                            className="p-3 rounded-3 text-center"
                            style={{ background: 'var(--pr-mint-bg)', border: '1px solid var(--pr-border)' }}
                          >
                            <span className="text-muted d-block small fw-medium mb-1">Lowest Observed</span>
                            <span className="fs-5 fw-bold" style={{ color: 'var(--pr-forest)' }}>
                              ₹{(minPrice / 100).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div
                            className="p-3 rounded-3 text-center"
                            style={{ background: '#FFFFFF', border: '1px solid var(--pr-border)' }}
                          >
                            <span className="text-muted d-block small fw-medium mb-1">Highest Observed</span>
                            <span className="fs-5 fw-bold" style={{ color: 'var(--pr-text-dark)' }}>
                              ₹{(maxPrice / 100).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        <div className="col-sm-4">
                          <div
                            className="p-3 rounded-3 text-center"
                            style={{ background: '#FFFFFF', border: '1px solid var(--pr-border)' }}
                          >
                            <span className="text-muted d-block small fw-medium mb-1">Latest Recorded</span>
                            <span className="fs-5 fw-bold" style={{ color: 'var(--pr-forest)' }}>
                              ₹{(latestPrice / 100).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Lightweight SVG Price Trend Sparkline */}
                  {(() => {
                    const points = activeHistory
                      .filter((h) => h.status === 'success' && typeof h.priceInPaise === 'number')
                      .slice(0, 10)
                      .reverse();

                    if (points.length < 2) return null;
                    const prices = points.map((p) => p.priceInPaise);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const range = max - min || 1;
                    const width = 600;
                    const height = 90;
                    const padding = 16;

                    const coords = points.map((p, idx) => {
                      const x = padding + (idx / (points.length - 1)) * (width - padding * 2);
                      const y = height - padding - ((p.priceInPaise - min) / range) * (height - padding * 2);
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <div
                        className="p-3 rounded-3 mb-4"
                        style={{ background: 'var(--pr-bg-soft)', border: '1px solid var(--pr-border)' }}
                      >
                        <span className="text-muted small fw-semibold d-block mb-2">Price Trend Line (Paise):</span>
                        <svg viewBox={`0 0 ${width} ${height}`} className="w-100" style={{ maxHeight: '100px' }}>
                          <polyline
                            fill="none"
                            stroke="var(--pr-forest)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={coords}
                          />
                        </svg>
                      </div>
                    );
                  })()}

                  <div className="table-responsive rounded-3" style={{ border: '1px solid var(--pr-border)' }}>
                    <table className="table table-hover small align-middle mb-0">
                      <thead style={{ background: 'var(--pr-bg-soft)' }}>
                        <tr>
                          <th className="py-2 px-3 fw-semibold text-muted">Observation Timestamp</th>
                          <th className="py-2 px-3 fw-semibold text-muted">Observed Price</th>
                          <th className="py-2 px-3 fw-semibold text-muted">Fetch Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeHistory.slice(0, 8).map((h, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3">{new Date(h.fetchedAt).toLocaleString('en-IN')}</td>
                            <td className="py-2 px-3 fw-bold" style={{ color: 'var(--pr-forest)' }}>
                              {h.priceInPaise
                                ? `₹${(h.priceInPaise / 100).toLocaleString('en-IN')}`
                                : '—'}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`badge rounded-pill ${
                                  h.status === 'success' ? 'pr-badge-live' : 'bg-danger-subtle text-danger'
                                }`}
                              >
                                {h.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted small mb-0">
                  No historical price observations recorded yet for this tracked offer. The scheduled price monitor records observations each cycle.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
