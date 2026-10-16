import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

export default function DiagnosticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all | pass | fail | warning | not_configured
  const [expandedCategories, setExpandedCategories] = useState({});
  const [copied, setCopied] = useState(false);
  const [sourceCheckLoading, setSourceCheckLoading] = useState({});
  const [sourceResults, setSourceResults] = useState({});

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDiagnostics();
      setData(res);
      // Expand categories that contain warnings or failures by default
      if (res?.categories) {
        const initialExpanded = {};
        Object.entries(res.categories).forEach(([key, cat]) => {
          const hasIssues = cat.checks.some((c) => c.status === 'FAIL' || c.status === 'WARNING');
          initialExpanded[key] = hasIssues || key === 'environment' || key === 'sources';
        });
        setExpandedCategories(initialExpanded);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to load diagnostics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  function toggleCategory(catKey) {
    setExpandedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey],
    }));
  }

  function handleCopyReport() {
    if (!data) return;
    const reportText = `PriceRadar System Diagnostics Report
Generated: ${data.summary?.generatedAt}
Status: ${data.summary?.overallStatus}
Summary: ${data.summary?.passed}/${data.summary?.total} Passed, ${data.summary?.failed} Failed, ${data.summary?.warnings} Warnings, ${data.summary?.notConfigured} Not Configured

${Object.entries(data.categories || {})
  .map(([k, cat]) => {
    const checkLines = cat.checks
      .map(
        (c) =>
          `  [${c.status}] ${c.name} (${c.component}) - ${c.actual}${c.error ? ` | Error: ${c.error}` : ''}`
      )
      .join('\n');
    return `${cat.name}:\n${checkLines}`;
  })
  .join('\n\n')}`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadJson() {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `priceradar-diagnostics-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleVerifySource(sourceId) {
    setSourceCheckLoading((prev) => ({ ...prev, [sourceId]: true }));
    try {
      const res = await api.verifyDiagnosticSource(sourceId);
      setSourceResults((prev) => ({ ...prev, [sourceId]: res }));
    } catch (err) {
      setSourceResults((prev) => ({
        ...prev,
        [sourceId]: { error: err.response?.data?.error?.message || err.message },
      }));
    } finally {
      setSourceCheckLoading((prev) => ({ ...prev, [sourceId]: false }));
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'PASS':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 fw-semibold">PASS</span>;
      case 'FAIL':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1.5 fw-semibold">FAIL</span>;
      case 'WARNING':
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1.5 fw-semibold">WARNING</span>;
      case 'SKIPPED':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1.5 fw-semibold">SKIPPED</span>;
      case 'NOT CONFIGURED':
        return <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2.5 py-1.5 fw-semibold">NOT CONFIGURED</span>;
      default:
        return <span className="badge bg-light text-dark border px-2.5 py-1.5">{status}</span>;
    }
  }

  const summary = data?.summary || { total: 0, passed: 0, failed: 0, warnings: 0, skipped: 0, notConfigured: 0 };
  const categories = data?.categories || {};

  return (
    <div className="py-4" style={{ backgroundColor: 'var(--pr-cream, #FAFBF8)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '1100px' }}>
        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <span className="eyebrow text-uppercase fw-semibold" style={{ color: 'var(--pr-forest)', letterSpacing: '0.08em', fontSize: '0.78rem' }}>
              DEVELOPER & SYSTEM ADMINISTRATION
            </span>
            <h1 className="fw-bold tracking-tight mb-1" style={{ fontSize: '2.2rem', color: 'var(--pr-forest, #183C2B)' }}>
              System Diagnostics
            </h1>
            <p className="text-muted small mb-0">
              End-to-end operational health, product sources, auth security, and subsystem checks.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3 py-2 d-inline-flex align-items-center gap-2"
              onClick={handleCopyReport}
              disabled={loading || !data}
            >
              <span>{copied ? '✓ Copied' : 'Copy Report'}</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary px-3 py-2 d-inline-flex align-items-center gap-2"
              onClick={handleDownloadJson}
              disabled={loading || !data}
            >
              <span>Download JSON</span>
            </button>
            <button
              type="button"
              className="btn btn-sm px-3 py-2 d-inline-flex align-items-center gap-2 fw-semibold"
              style={{ backgroundColor: 'var(--pr-lime, #CEEB5D)', color: 'var(--pr-forest, #183C2B)', border: 'none' }}
              onClick={fetchDiagnostics}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <span>↻</span>
                  <span>Run All Diagnostics</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4 shadow-sm" role="alert">
            <div className="fw-bold mb-1">Diagnostic Runner Error</div>
            <div className="small">{error}</div>
          </div>
        )}

        {/* Top Summary Dashboard Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-2">
            <div className="card h-100 border-0 shadow-sm p-3 rounded-3 bg-white">
              <span className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Total Checks</span>
              <div className="fs-3 fw-bold mt-1 text-dark">{summary.total}</div>
              <div className="text-muted small mt-auto" style={{ fontSize: '0.72rem' }}>9 Categories</div>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="card h-100 border-0 shadow-sm p-3 rounded-3 bg-white">
              <span className="text-success small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Passed</span>
              <div className="fs-3 fw-bold mt-1 text-success">{summary.passed}</div>
              <div className="text-muted small mt-auto" style={{ fontSize: '0.72rem' }}>Healthy checks</div>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="card h-100 border-0 shadow-sm p-3 rounded-3 bg-white">
              <span className="text-danger small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Failed</span>
              <div className="fs-3 fw-bold mt-1 text-danger">{summary.failed}</div>
              <div className="text-muted small mt-auto" style={{ fontSize: '0.72rem' }}>Requires repair</div>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="card h-100 border-0 shadow-sm p-3 rounded-3 bg-white">
              <span className="text-warning-emphasis small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Warnings</span>
              <div className="fs-3 fw-bold mt-1 text-warning-emphasis">{summary.warnings}</div>
              <div className="text-muted small mt-auto" style={{ fontSize: '0.72rem' }}>Non-blocking</div>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="card h-100 border-0 shadow-sm p-3 rounded-3 bg-white">
              <span className="text-info-emphasis small text-uppercase fw-semibold" style={{ fontSize: '0.7rem' }}>Unconfigured</span>
              <div className="fs-3 fw-bold mt-1 text-info-emphasis">{summary.notConfigured}</div>
              <div className="text-muted small mt-auto" style={{ fontSize: '0.72rem' }}>Optional sources</div>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="card h-100 border-0 shadow-sm p-3 rounded-3 text-white" style={{ backgroundColor: 'var(--pr-forest, #183C2B)' }}>
              <span className="small text-uppercase fw-semibold opacity-75" style={{ fontSize: '0.7rem' }}>System Health</span>
              <div className="fs-4 fw-bold mt-1" style={{ color: summary.failed > 0 ? '#ff8585' : summary.warnings > 0 ? 'var(--pr-lime, #CEEB5D)' : '#8effab' }}>
                {summary.overallStatus}
              </div>
              <div className="small opacity-75 mt-auto" style={{ fontSize: '0.7rem' }}>
                {summary.generatedAt ? new Date(summary.generatedAt).toLocaleTimeString() : 'Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-semibold me-1">Filter Checks:</span>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All ({summary.total})
            </button>
            <button
              type="button"
              className={`btn btn-sm ${filter === 'pass' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('pass')}
            >
              Pass ({summary.passed})
            </button>
            {summary.failed > 0 && (
              <button
                type="button"
                className={`btn btn-sm ${filter === 'fail' ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => setFilter('fail')}
              >
                Fail ({summary.failed})
              </button>
            )}
            {summary.warnings > 0 && (
              <button
                type="button"
                className={`btn btn-sm ${filter === 'warning' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setFilter('warning')}
              >
                Warnings ({summary.warnings})
              </button>
            )}
            {summary.notConfigured > 0 && (
              <button
                type="button"
                className={`btn btn-sm ${filter === 'not_configured' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setFilter('not_configured')}
              >
                Not Configured ({summary.notConfigured})
              </button>
            )}
          </div>

          <div className="text-muted small">
            Click any section header to expand or collapse details.
          </div>
        </div>

        {/* Grouped Category Check Cards */}
        <div className="d-flex flex-column gap-3 mb-5">
          {Object.entries(categories).map(([catKey, category]) => {
            const isExpanded = Boolean(expandedCategories[catKey]);
            const filteredChecks = category.checks.filter((c) => {
              if (filter === 'pass') return c.status === 'PASS';
              if (filter === 'fail') return c.status === 'FAIL';
              if (filter === 'warning') return c.status === 'WARNING';
              if (filter === 'not_configured') return c.status === 'NOT CONFIGURED';
              return true;
            });

            if (filteredChecks.length === 0 && filter !== 'all') {
              return null;
            }

            const catPassed = category.checks.filter((c) => c.status === 'PASS').length;
            const catTotal = category.checks.length;
            const hasFailures = category.checks.some((c) => c.status === 'FAIL');
            const hasWarnings = category.checks.some((c) => c.status === 'WARNING');

            return (
              <div key={catKey} className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                {/* Category Header */}
                <button
                  type="button"
                  className="w-100 text-start p-3 d-flex align-items-center justify-content-between border-0 bg-white"
                  onClick={() => toggleCategory(catKey)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <span
                      className="d-inline-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: hasFailures ? '#fee2e2' : hasWarnings ? '#fef3c7' : 'var(--pr-mint-bg, #EAF2E6)',
                        color: hasFailures ? '#dc2626' : hasWarnings ? '#d97706' : 'var(--pr-forest, #183C2B)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {hasFailures ? '!' : hasWarnings ? '▲' : '✓'}
                    </span>
                    <div>
                      <h2 className="h6 fw-bold mb-0 text-dark">{category.name}</h2>
                      <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {catPassed} of {catTotal} checks passed
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {hasFailures && <span className="badge bg-danger-subtle text-danger px-2 py-1">FAIL</span>}
                    {!hasFailures && hasWarnings && <span className="badge bg-warning-subtle text-warning-emphasis px-2 py-1">WARNING</span>}
                    {!hasFailures && !hasWarnings && <span className="badge bg-success-subtle text-success px-2 py-1">OK</span>}
                    <span className="text-muted small ms-2">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </button>

                {/* Category Body / Checks Table */}
                {isExpanded && (
                  <div className="border-top p-0">
                    <div className="list-group list-group-flush">
                      {filteredChecks.map((check) => (
                        <div key={check.id} className="list-group-item p-3 border-0 border-bottom">
                          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="fw-semibold text-dark small">{check.name}</span>
                              <span className="badge bg-light text-muted border" style={{ fontSize: '0.68rem' }}>
                                {check.component}
                              </span>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                              <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {check.durationMs}ms
                              </span>
                              {getStatusBadge(check.status)}
                            </div>
                          </div>

                          <div className="row g-2 small mt-1 text-muted" style={{ fontSize: '0.8rem' }}>
                            <div className="col-12 col-md-6">
                              <span className="fw-medium text-secondary">Expected: </span>
                              <span>{check.expected}</span>
                            </div>
                            <div className="col-12 col-md-6">
                              <span className="fw-medium text-secondary">Observed: </span>
                              <span className={check.status === 'FAIL' ? 'text-danger fw-medium' : check.status === 'WARNING' ? 'text-warning-emphasis' : 'text-dark'}>
                                {check.actual}
                              </span>
                            </div>
                          </div>

                          {/* Actionable Repair & Error Guidance */}
                          {(check.error || check.recommendation !== 'None') && (
                            <div
                              className="mt-2 p-2.5 rounded-2"
                              style={{
                                backgroundColor: check.status === 'FAIL' ? '#fef2f2' : check.status === 'WARNING' ? '#fffbeb' : '#f0fdf4',
                                borderLeft: `3px solid ${check.status === 'FAIL' ? '#ef4444' : check.status === 'WARNING' ? '#f59e0b' : '#22c55e'}`,
                              }}
                            >
                              {check.error && (
                                <div className="text-danger small mb-1">
                                  <strong>Error:</strong> {check.error}
                                </div>
                              )}
                              {check.likelyCause && (
                                <div className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
                                  <strong>Likely Cause:</strong> {check.likelyCause}
                                </div>
                              )}
                              {check.recommendation && check.recommendation !== 'None' && (
                                <div className="text-dark small" style={{ fontSize: '0.78rem' }}>
                                  <strong>Recommended Action:</strong> {check.recommendation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Deep Verification & Live Smoke Diagnostics Card */}
        <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-5">
          <h2 className="h5 fw-bold text-dark mb-1">Targeted Source Diagnostics</h2>
          <p className="text-muted small mb-3">
            Trigger on-demand credentials and connectivity audits without exposing secret values.
          </p>

          <div className="row g-3">
            {/* eBay Deep Check */}
            <div className="col-12 col-md-6">
              <div className="p-3 border rounded-3 h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold small text-dark">eBay Browse API Audit</span>
                  <span className="badge bg-light text-muted border">Marketplace</span>
                </div>
                <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
                  Tests OAuth 2.0 application client credentials exchange, Browse API permissions, and sandbox/production status.
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-forest mt-auto py-1.5"
                  onClick={() => handleVerifySource('ebay')}
                  disabled={sourceCheckLoading.ebay}
                >
                  {sourceCheckLoading.ebay ? 'Verifying...' : 'Verify eBay Connection'}
                </button>

                {sourceResults.ebay && (
                  <div className="mt-3 p-2 bg-light rounded small" style={{ fontSize: '0.75rem' }}>
                    <div><strong>Configured:</strong> {String(sourceResults.ebay.configured)}</div>
                    <div><strong>Environment:</strong> {sourceResults.ebay.environment || 'N/A'}</div>
                    <div><strong>OAuth Status:</strong> {sourceResults.ebay.authStatus || 'N/A'}</div>
                    <div><strong>Browse API:</strong> {sourceResults.ebay.browseApiStatus || 'N/A'}</div>
                    {sourceResults.ebay.message && (
                      <div className="text-muted mt-1"><em>{sourceResults.ebay.message}</em></div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Apify Deep Check */}
            <div className="col-12 col-md-6">
              <div className="p-3 border rounded-3 h-100 d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold small text-dark">Apify Platform Audit</span>
                  <span className="badge bg-light text-muted border">Scraping Actors</span>
                </div>
                <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>
                  Verifies token presence and configured retailer actor mapping (Amazon, Flipkart, Meesho).
                </p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-forest mt-auto py-1.5"
                  onClick={() => handleVerifySource('apify')}
                  disabled={sourceCheckLoading.apify}
                >
                  {sourceCheckLoading.apify ? 'Verifying...' : 'Audit Apify Configuration'}
                </button>

                {sourceResults.apify && (
                  <div className="mt-3 p-2 bg-light rounded small" style={{ fontSize: '0.75rem' }}>
                    <div><strong>Configured:</strong> {String(sourceResults.apify.configured)}</div>
                    <div><strong>Token Present:</strong> {String(sourceResults.apify.tokenConfigured)}</div>
                    {sourceResults.apify.actors && (
                      <div className="mt-1">
                        <div><strong>Amazon Actor:</strong> {sourceResults.apify.actors.amazon}</div>
                        <div><strong>Flipkart Actor:</strong> {sourceResults.apify.actors.flipkart}</div>
                        <div><strong>Meesho Actor:</strong> {sourceResults.apify.actors.meesho}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
