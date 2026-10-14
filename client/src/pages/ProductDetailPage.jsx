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

        // Load price history for the first tracked offer
        const tracked = offerList.find(
          (o) =>
            o.id &&
            !o.id.startsWith('dummyjson-') &&
            !o.id.startsWith('mockshop-') &&
            !o.id.startsWith('ebay-')
        );
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
        <div className="alert alert-light border d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 text-muted small">
          <span>ℹ️</span>
          <span>
            <strong>Sample Demonstration Listing:</strong> This item is sourced from our free demonstration catalog ({product.sourceProvider || 'sample catalog'}). Genuine live market comparisons and price alerts are only enabled for verified retailer feeds.
          </span>
        </div>
      )}

      {/* Main Product Card */}
      <div className="card shadow-sm mb-4 border bg-white">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row gap-4 align-items-md-start mb-4 pb-3 border-bottom">
            {product.imageUrl && (
              <div
                className="d-flex align-items-center justify-content-center bg-light rounded border p-2 align-self-center align-self-md-start"
                style={{ width: '180px', height: '180px', minWidth: '180px' }}
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
                  <span className="badge bg-secondary-subtle text-secondary border text-capitalize">
                    {product.category}
                  </span>
                )}
                {isSampleProduct ? (
                  <span className="badge badge-sample">Sample Catalog</span>
                ) : (
                  <span className="badge badge-live">Verified Retailer</span>
                )}
              </div>

              <h1 className="h4 mb-2 fw-bold text-dark">{product.title}</h1>

              {(product.brand || product.model || product.variant) && (
                <p className="text-muted small mb-3">
                  {[product.brand, product.model, product.variant].filter(Boolean).join(' · ')}
                </p>
              )}

              {product.description && (
                <p className="text-muted small mb-0" style={{ maxWidth: '700px' }}>
                  {product.description}
                </p>
              )}
            </div>
          </div>

          {/* Offers Section */}
          <div className="mb-4">
            <h2 className="h6 fw-bold mb-3">Available Store Offers &amp; Comparison</h2>
            {offers.length === 0 ? (
              <div className="p-3 bg-light rounded text-muted small">
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
                            className="btn btn-link btn-sm text-decoration-none small text-muted py-0"
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

          {/* Genuine Stored Observations History */}
          {activeHistoryOffer && (
            <div className="mt-4 pt-4 border-top">
              <h3 className="h6 fw-bold mb-2">Verified Price Observation History</h3>
              {activeHistory && activeHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered small align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Observation Timestamp</th>
                        <th>Observed Price</th>
                        <th>Fetch Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeHistory.slice(0, 5).map((h, idx) => (
                        <tr key={idx}>
                          <td>{new Date(h.fetchedAt).toLocaleString('en-IN')}</td>
                          <td className="fw-semibold">
                            {h.priceInPaise
                              ? `₹${(h.priceInPaise / 100).toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                h.status === 'success'
                                  ? 'bg-success-subtle text-success'
                                  : 'bg-danger-subtle text-danger'
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
