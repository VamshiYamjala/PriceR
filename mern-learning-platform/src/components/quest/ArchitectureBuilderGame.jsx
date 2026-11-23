import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { FolderTree, CheckCircle2, AlertCircle, RotateCcw, Award, ArrowRight } from 'lucide-react';

const CHALLENGE_FILES = [
  { id: 'f1', name: 'Login.jsx', correctFolder: 'client/src/pages/', role: 'Full-screen page view rendered when browsing /login route.' },
  { id: 'f2', name: 'ProductCard.jsx', correctFolder: 'client/src/components/', role: 'Reusable UI component displaying title, image, and price.' },
  { id: 'f3', name: 'api.js', correctFolder: 'client/src/services/', role: 'Axios instance configured with baseURL and JWT request interceptors.' },
  { id: 'f4', name: 'productRoutes.js', correctFolder: 'server/src/routes/', role: 'Express router defining GET /api/products URL and HTTP verbs.' },
  { id: 'f5', name: 'productController.js', correctFolder: 'server/src/controllers/', role: 'Executes Mongoose text search queries and returns JSON.' },
  { id: 'f6', name: 'Offer.js', correctFolder: 'server/src/models/', role: 'Mongoose schema defining integer-paise prices and unique compound index.' },
  { id: 'f7', name: 'authMiddleware.js', correctFolder: 'server/src/middleware/', role: 'Verifies incoming JWT token signature before allowing access.' },
  { id: 'f8', name: 'db.js', correctFolder: 'server/src/config/', role: 'Establishes MongoDB Mongoose connection with retry handling.' },
  { id: 'f9', name: 'priceMonitor.js', correctFolder: 'server/src/services/', role: 'Background service handling distributed locking and price scraping.' },
  { id: 'f10', name: 'money.js', correctFolder: 'server/src/utils/', role: 'Utility functions converting between rupees and integer paise.' }
];

const BUCKETS = [
  'client/src/pages/',
  'client/src/components/',
  'client/src/services/',
  'server/src/routes/',
  'server/src/controllers/',
  'server/src/models/',
  'server/src/middleware/',
  'server/src/config/',
  'server/src/services/',
  'server/src/utils/'
];

export default function ArchitectureBuilderGame() {
  const { awardXP, unlockAchievement } = useGame();
  const [placements, setPlacements] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectBucket = (fileId, bucket) => {
    if (submitted) return;
    setPlacements(prev => ({ ...prev, [fileId]: bucket }));
  };

  const calculateScore = () => {
    let score = 0;
    CHALLENGE_FILES.forEach(f => {
      if (placements[f.id] === f.correctFolder) score++;
    });
    return score;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const score = calculateScore();
    if (score === CHALLENGE_FILES.length) {
      awardXP(200, 'Perfect score on Architecture Builder!');
      unlockAchievement('ach_arch_builder');
    } else {
      awardXP(score * 15, `Architecture Builder: ${score}/${CHALLENGE_FILES.length} correct`);
    }
  };

  const handleReset = () => {
    setPlacements({});
    setSubmitted(false);
  };

  const score = calculateScore();
  const allPlaced = Object.keys(placements).length === CHALLENGE_FILES.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            background: '#3b82f6',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Architecture Challenge
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Interactive Directory Builder
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#fff' }}>
          The Architecture Builder: Organize Full-Stack Files
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          One of the top marks of a professional MERN architect is knowing exactly which folder each file belongs in. Assign every file below to its proper architectural layer.
        </p>
      </div>

      {/* Workspace */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
            Files to Organize ({Object.keys(placements).length} of {CHALLENGE_FILES.length} assigned)
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleReset}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            {!submitted ? (
              <button
                disabled={!allPlaced}
                onClick={handleSubmit}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: allPlaced ? '#10b981' : 'var(--bg-secondary)',
                  color: allPlaced ? '#fff' : 'var(--text-muted)',
                  cursor: allPlaced ? 'pointer' : 'not-allowed',
                  fontWeight: 700,
                  boxShadow: allPlaced ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                Submit & Grade Architecture
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: 700 }}>
                <Award size={20} />
                <span>Score: {score} / {CHALLENGE_FILES.length} Correct</span>
              </div>
            )}
          </div>
        </div>

        {/* Files Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {CHALLENGE_FILES.map(file => {
            const assigned = placements[file.id];
            const isCorrect = assigned === file.correctFolder;

            return (
              <div
                key={file.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: submitted
                    ? isCorrect ? '2px solid #10b981' : '2px solid #ef4444'
                    : assigned ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ maxWidth: '420px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      {file.name}
                    </span>
                    {submitted && (
                      isCorrect ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <AlertCircle size={16} color="#ef4444" />
                      )
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {file.role}
                  </div>
                  {submitted && !isCorrect && (
                    <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                      Correct Location: {file.correctFolder}
                    </div>
                  )}
                </div>

                {/* Folder Select Dropdown */}
                <select
                  disabled={submitted}
                  value={assigned || ''}
                  onChange={(e) => handleSelectBucket(file.id, e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.85rem',
                    cursor: submitted ? 'default' : 'pointer'
                  }}
                >
                  <option value="">-- Choose Target Folder --</option>
                  {BUCKETS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
