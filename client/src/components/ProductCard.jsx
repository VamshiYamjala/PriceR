import OfferRow from './OfferRow';

export default function ProductCard({ product, onOpen }) {
  const { title, brand, model, variant, category, imageUrl, sourceProvider, dataStatus, offers = [] } = product;

  const visibleOffers = offers.slice(0, 2);
  const validOffers = visibleOffers.filter((o) => o.availability !== 'out_of_stock' && o.lastStatus !== 'error');
  const lowestOfferId =
    validOffers.length > 0
      ? validOffers.reduce((min, o) => (o.priceInPaise < min.priceInPaise ? o : min)).id
      : null;

  const isSample = dataStatus === 'sample' || product.isSample;

  return (
    <div className="card card-hover mb-3" style={{ cursor: 'pointer' }} onClick={onOpen}>
      <div className="card-body p-3">
        <div className="d-flex flex-column flex-sm-row gap-3">
          {imageUrl && (
            <div
              className="d-flex align-items-center justify-content-center bg-light rounded p-2 align-self-start"
              style={{ width: '90px', height: '90px', minWidth: '90px' }}
            >
              <img
                src={imageUrl}
                alt={title}
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                loading="lazy"
                onError={(e) => {
                  e.target.parentElement.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-grow-1">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-1">
              <h3 className="h6 mb-0 fw-bold text-dark">{title}</h3>
              <div className="d-flex gap-1 align-items-center">
                {category && (
                  <span className="badge bg-light text-secondary border small text-capitalize">
                    {category}
                  </span>
                )}
                {isSample ? (
                  <span className="badge badge-sample small">Sample Catalog</span>
                ) : (
                  <span className="badge badge-live small">Live Retailer</span>
                )}
              </div>
            </div>

            {(brand || model || variant) && (
              <p className="text-muted small mb-2">
                {[brand, model, variant].filter(Boolean).join(' · ')}
              </p>
            )}

            <div className="d-flex flex-column gap-2 mt-2">
              {visibleOffers.map((offer) => (
                <OfferRow
                  key={offer.id || `${offer.provider}-${offer.priceInPaise}`}
                  offer={offer}
                  isLowest={offer.id === lowestOfferId}
                />
              ))}
            </div>

            {offers.length > 2 && (
              <div className="text-muted small mt-2">
                + {offers.length - 2} more retailer offer(s) available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
