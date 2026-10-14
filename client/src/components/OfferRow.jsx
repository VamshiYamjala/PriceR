export default function OfferRow({ offer, isLowest }) {
  const priceInRupees = (offer.priceInPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="d-flex justify-content-between align-items-center border rounded p-2">
      <div>
        <div className="text-capitalize fw-semibold small">{offer.provider}</div>
        <div className="fs-5 fw-bold">
          {priceInRupees}
          {isLowest && <span className="badge text-bg-success ms-2">Lowest price</span>}
        </div>
        {offer.isSample && (
          <span className="badge bg-secondary-subtle text-secondary">Sample data</span>
        )}
      </div>
      <a
        href={offer.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline-primary btn-sm"
        onClick={(e) => e.stopPropagation()}
      >
        View on {offer.provider}
      </a>
    </div>
  );
}
