import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileCode, Server, BookMarked, ArrowRight } from 'lucide-react';
import { MODULES } from '../../data/modulesData';
import { PRICERADAR_ENDPOINTS } from '../../data/endpointsData';
import { PRICERADAR_FILES } from '../../data/filesData';
import { GLOSSARY_TERMS } from '../../data/glossaryData';

export default function SearchModal({ isOpen, onClose, onSelectModule, onOpenGlossary }) {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const cleanQuery = query.toLowerCase().trim();

  // Search Results
  const matchedModules = cleanQuery
    ? MODULES.filter(m => m.title.toLowerCase().includes(cleanQuery) || m.summary.toLowerCase().includes(cleanQuery))
    : [];

  const matchedEndpoints = cleanQuery
    ? PRICERADAR_ENDPOINTS.filter(e => e.path.toLowerCase().includes(cleanQuery) || e.purpose.toLowerCase().includes(cleanQuery))
    : [];

  const matchedFiles = cleanQuery
    ? PRICERADAR_FILES.filter(f => f.path.toLowerCase().includes(cleanQuery) || f.purpose.toLowerCase().includes(cleanQuery))
    : [];

  const matchedTerms = cleanQuery
    ? GLOSSARY_TERMS.filter(t => t.term.toLowerCase().includes(cleanQuery) || t.definition.toLowerCase().includes(cleanQuery))
    : [];

  const totalResults = matchedModules.length + matchedEndpoints.length + matchedFiles.length + matchedTerms.length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      paddingTop: '80px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '680px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '75vh',
        overflow: 'hidden'
      }}>
        {/* Search Input Bar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-secondary)'
        }}>
          <Search size={22} color="var(--accent-color)" />
          <input
            autoFocus
            type="text"
            placeholder="Search modules, API endpoints, files, or glossary terms... (Press ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Results Container */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1 }}>
          {query.trim() === '' ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Search size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Search across the entire MERN curriculum
              </div>
              <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                Try typing "JWT", "Axios", "Offer.js", "POST /api/auth/login", or "Paise"
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No results found for "{query}".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Modules */}
              {matchedModules.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                    Learning Modules ({matchedModules.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {matchedModules.map(m => (
                      <div
                        key={m.id}
                        onClick={() => { onSelectModule(m.id); onClose(); }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <BookOpen size={16} color="var(--accent-color)" />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              Module {m.id}: {m.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {m.summary}
                            </div>
                          </div>
                        </div>
                        <ArrowRight size={14} color="var(--text-muted)" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Endpoints */}
              {matchedEndpoints.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                    API Endpoints ({matchedEndpoints.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {matchedEndpoints.slice(0, 5).map((e, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Server size={16} color="#10b981" />
                          <div>
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                              <span style={{ color: e.method === 'GET' ? '#3b82f6' : e.method === 'POST' ? '#10b981' : '#f59e0b' }}>
                                {e.method}
                              </span>{' '}
                              {e.path}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {e.purpose}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real Project Files */}
              {matchedFiles.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                    PriceRadar Source Files ({matchedFiles.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {matchedFiles.slice(0, 5).map((f, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <FileCode size={16} color="#8b5cf6" />
                        <div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                            {f.path}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {f.purpose}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glossary Terms */}
              {matchedTerms.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                    Glossary Terms ({matchedTerms.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {matchedTerms.slice(0, 5).map((t, idx) => (
                      <div
                        key={idx}
                        onClick={() => { if (onOpenGlossary) onOpenGlossary(t.term); onClose(); }}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <BookMarked size={16} color="#f59e0b" />
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            {t.term}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {t.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
