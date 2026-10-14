import OfferRow from './OfferRow';

export default function ProductCard({ product, onOpen }) {
  const { title, brand, variant, offers = [] } = product;

  // Determine the lowest-priced offer among the ones shown on the card.
  // Document 1 Section 13.4 defines "valid" as in_stock or unknown, not error —
  // the card shows at most 2 offers so we apply the same rule here.
  const visibleOffers = offers.slice(0, 2);
  const validOffers = visibleOffers.filter((o) => o.availability !== 'out_of_stock');
  const lowestOfferId =
    validOffers.length > 0
      ? validOffers.reduce((min, o) => (o.priceInPaise < min.priceInPaise ? o : min)).id
      : null;

  return (
    <div className="card shadow-sm" style={{ cursor: 'pointer' }}>
      <div className="card-body" onClick={onOpen}>
        <h3 className="h6 mb-1">{title}</h3>
        {(brand || variant) && (
          <p className="text-muted small mb-3">
            {[brand, variant].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="d-flex flex-column gap-2">
          {visibleOffers.map((offer) => (
            <OfferRow
              key={offer.id || `${offer.provider}-${offer.priceInPaise}`}
              offer={offer}
              isLowest={offer.id === lowestOfferId}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
