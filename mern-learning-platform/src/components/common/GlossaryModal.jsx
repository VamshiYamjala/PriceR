import React, { useState } from 'react';
import { X, BookMarked, Search, Filter, Code2, Sparkles } from 'lucide-react';
import { GLOSSARY_TERMS } from '../../data/glossaryData';

export default function GlossaryModal({ isOpen, onClose, initialTerm = '' }) {
  if (!isOpen) return null;

  const [search, setSearch] = useState(initialTerm);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Architecture', 'Frontend', 'Backend', 'Database', 'Security', 'DevOps & Automation'];

  const filteredTerms = GLOSSARY_TERMS.filter(item => {
    const matchesSearch = item.term.toLowerCase().includes(search.toLowerCase()) ||
                          item.definition.toLowerCase().includes(search.toLowerCase()) ||
                          item.analogy.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '840px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '85vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookMarked size={22} color="var(--accent-color)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Full-Stack Technical Glossary ({GLOSSARY_TERMS.length} Terms)
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Every key MERN term explained with real-life analogies and PriceRadar source references
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '8px 14px',
            borderRadius: '8px'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter terms or analogies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: 'none',
                  background: selectedCategory === cat ? 'var(--accent-color)' : 'var(--bg-secondary)',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms List */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTerms.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No glossary terms found matching your filter.
            </div>
          ) : (
            filteredTerms.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                      {item.term}
                    </h4>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      color: 'var(--accent-color)',
                      fontWeight: 600
                    }}>
                      {item.category}
                    </span>
                  </div>
                </div>

                <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '12px' }}>
                  {item.definition}
                </div>

                {/* Real Life Analogy */}
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <Sparkles size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    <strong style={{ color: '#f59e0b' }}>Beginner Analogy: </strong>{item.analogy}
                  </div>
                </div>

                {/* Project Reference */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)'
                }}>
                  <Code2 size={14} color="var(--accent-color)" />
                  <span>Where it is used in PriceRadar: </span>
                  <code style={{ color: 'var(--accent-color)', background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>
                    {item.projectRef}
                  </code>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
