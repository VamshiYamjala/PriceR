import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/api';
import OfferRow from '../components/OfferRow';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(productId);
        setProduct(data?.product || data);
        setOffers(data?.offers || data?.product?.offers || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

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
      <div className="alert alert-danger my-4">
        <h5>Error loading product</h5>
        <p>{error || 'Product details are unavailable.'}</p>
        <Link to="/search" className="btn btn-outline-danger btn-sm">
          Back to Search
        </Link>
      </div>
    );
  }

  const validOffers = offers.filter((o) => o.availability !== 'out_of_stock' && o.lastStatus !== 'error');
  const lowestOfferId =
    validOffers.length > 0
      ? validOffers.reduce((min, o) => (o.priceInPaise < min.priceInPaise ? o : min)).id
      : null;

  return (
    <div className="py-2">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">Home</Link></li>
          <li className="breadcrumb-item"><Link to="/search">Search</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{product.title}</li>
        </ol>
      </nav>

      <div className="card shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-md-row gap-4 align-items-md-center mb-4">
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="img-fluid rounded border p-2"
                style={{ maxHeight: '180px', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div>
              <h1 className="h4 mb-1">{product.title}</h1>
              <p className="text-muted small mb-0">
                {[product.brand, product.model, product.variant].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          <h2 className="h6 fw-bold mb-3">Available Retailer Offers & Prices</h2>
          {offers.length === 0 ? (
            <p className="text-muted small">No retailer offers found for this product.</p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {offers.map((offer) => (
                <OfferRow
                  key={offer.id || offer._id}
                  offer={offer}
                  isLowest={(offer.id || offer._id) === lowestOfferId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
