export default function RadarLogo({ size = 26, variant = 'dark', showWordmark = true }) {
  const isDark = variant === 'dark';
  const textColor = isDark ? '#17211B' : '#FFFFFF';
  const strokeColor = '#183C2B';

  return (
    <div className="d-inline-flex align-items-center gap-2" style={{ userSelect: 'none' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Lime Background Circle */}
        <circle cx="12" cy="12" r="11" fill="#CEEB5D" />
        {/* Concentric Radar Rings */}
        <circle cx="12" cy="12" r="7.5" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="1.5 1" />
        <circle cx="12" cy="12" r="4.5" stroke={strokeColor} strokeWidth="1.5" />
        {/* Radar Center Signal Dot */}
        <circle cx="12" cy="12" r="1.75" fill={strokeColor} />
      </svg>
      {showWordmark && (
        <span
          className="fw-bold tracking-tight"
          style={{
            color: textColor,
            fontSize: `${size * 0.75}px`,
            letterSpacing: '-0.025em',
            lineHeight: 1,
          }}
        >
          PriceRadar
        </span>
      )}
    </div>
  );
}
