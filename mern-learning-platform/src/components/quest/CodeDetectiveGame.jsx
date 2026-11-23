import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { PRICERADAR_FILES } from '../../data/filesData';
import { Search, FileCode, CheckCircle2, HelpCircle, Eye, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const DETECTIVE_CLUES = [
  {
    id: 'clue_login',
    title: 'Case #1: The Secret Sign-in Handler',
    prompt: 'A user attempts to sign into PriceRadar. Find the controller function that compares password hashes using bcrypt and signs the JWT.',
    targetFile: 'server/src/controllers/authController.js',
    hint: 'Look inside server/src/controllers/ for authentication operations.',
    answerDetails: 'authController.js uses bcrypt.compare() to verify passwords and jwt.sign() to create an access token with user ID and role.'
  },
  {
    id: 'clue_db',
    title: 'Case #2: The Database Anchor',
    prompt: 'Where does the backend establish its Mongoose connection to MongoDB with connection pooling and retry logic?',
    targetFile: 'server/src/config/db.js',
    hint: 'Look in server/src/config/ for database configuration.',
    answerDetails: 'db.js exports connectDB(), utilizing mongoose.connect(process.env.MONGODB_URI) with event listeners for connected, error, and disconnected events.'
  },
  {
    id: 'clue_auth_guard',
    title: 'Case #3: The Route Checkpoint Sentinel',
    prompt: 'Find the middleware that verifies incoming Authorization: Bearer <token> headers and attaches req.user.',
    targetFile: 'server/src/middleware/authMiddleware.js',
    hint: 'Look in server/src/middleware/ for authorization logic.',
    answerDetails: 'authMiddleware.js extracts the Bearer token, runs jwt.verify(), and populates req.user while rejecting expired or forged tokens with 401.'
  },
  {
    id: 'clue_paise',
    title: 'Case #4: The Financial Precision Vault',
    prompt: 'Find the Mongoose model that strictly enforces integer paise (validate: Number.isInteger) to prevent floating-point rounding errors.',
    targetFile: 'server/src/models/Offer.js',
    hint: 'Look in server/src/models/ where product store offers and prices are modeled.',
    answerDetails: 'Offer.js defines priceInPaise as an integer, preventing JavaScript 0.1 + 0.2 floating-point billing bugs across the application.'
  },
  {
    id: 'clue_lock',
    title: 'Case #5: The Concurrency Lease Shield',
    prompt: 'Find the model responsible for distributed mutex locking to prevent multiple workers from scraping Amazon concurrently.',
    targetFile: 'server/src/models/MonitorLock.js',
    hint: 'Look in server/src/models/ for distributed lock leases.',
    answerDetails: 'MonitorLock.js implements an atomic lease with expiresAt heartbeats, ensuring only one background cron process can scrape vendor prices at any time.'
  }
];

export default function CodeDetectiveGame() {
  const { awardXP, unlockAchievement } = useGame();
  const [activeClueIdx, setActiveClueIdx] = useState(0);
  const [selectedFilePath, setSelectedFilePath] = useState(PRICERADAR_FILES[0]?.path || '');
  const [solvedClues, setSolvedClues] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const activeClue = DETECTIVE_CLUES[activeClueIdx];
  const selectedFile = PRICERADAR_FILES.find(f => f.path === selectedFilePath) || PRICERADAR_FILES[0];

  const handleInspectFile = (filePath) => {
    setSelectedFilePath(filePath);
    // Check if this file solves current clue
    if (filePath === activeClue.targetFile && !solvedClues.includes(activeClue.id)) {
      setSolvedClues(prev => [...prev, activeClue.id]);
      awardXP(120, `Solved Detective Case: ${activeClue.title}!`);
      if (solvedClues.length + 1 >= DETECTIVE_CLUES.length) {
        unlockAchievement('ach_code_detective');
      }
    }
  };

  const isCurrentClueSolved = solvedClues.includes(activeClue.id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #311042, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            background: '#8b5cf6',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Investigation Mode
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Solved {solvedClues.length} of {DETECTIVE_CLUES.length} Cases
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#fff' }}>
          Code Detective: PriceRadar Source Code Investigation
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Explore the real PriceRadar codebase to locate critical architecture files, inspect real imports/exports, and solve engineering detective cases.
        </p>
      </div>

      {/* Detective Mission Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: isCurrentClueSolved ? '2px solid #10b981' : '1px solid var(--border-color)',
        borderRadius: '14px',
        padding: '20px',
        boxShadow: isCurrentClueSolved ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: isCurrentClueSolved ? '#10b98120' : 'rgba(139, 92, 246, 0.2)',
                color: isCurrentClueSolved ? '#10b981' : '#8b5cf6',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                Case {activeClueIdx + 1} of {DETECTIVE_CLUES.length}
              </span>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.15rem' }}>
                {activeClue.title}
              </h3>
            </div>
            <p style={{ margin: '6px 0 0 0', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              {activeClue.prompt}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowHint(prev => !prev)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <HelpCircle size={14} />
              {showHint ? 'Hide Clue' : 'Reveal Clue'}
            </button>

            <button
              disabled={activeClueIdx === DETECTIVE_CLUES.length - 1}
              onClick={() => { setActiveClueIdx(prev => prev + 1); setShowHint(false); }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: 'var(--accent-color)',
                color: '#fff',
                cursor: activeClueIdx === DETECTIVE_CLUES.length - 1 ? 'not-allowed' : 'pointer',
                opacity: activeClueIdx === DETECTIVE_CLUES.length - 1 ? 0.4 : 1,
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Next Case
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {showHint && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.85rem'
          }}>
            <strong>Detective Hint: </strong>{activeClue.hint}
          </div>
        )}

        {isCurrentClueSolved && (
          <div style={{
            marginTop: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            <span><strong>Case Solved!</strong> {activeClue.answerDetails}</span>
          </div>
        )}
      </div>

      {/* Explorer Workspace */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        {/* Left: PriceRadar File Explorer */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '16px',
          height: '540px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '10px' }}>
            PriceRadar Source Tree
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {PRICERADAR_FILES.map((file) => {
              const isSelected = file.path === selectedFilePath;
              const isTargetForActive = file.path === activeClue.targetFile;

              return (
                <button
                  key={file.path}
                  onClick={() => handleInspectFile(file.path)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: isSelected ? 'var(--bg-card)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    borderLeft: isSelected ? '3px solid var(--accent-color)' : '3px solid transparent'
                  }}
                >
                  <FileCode size={14} color={isSelected ? 'var(--accent-color)' : 'var(--text-muted)'} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {file.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Inspector */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          height: '540px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {selectedFile ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    {selectedFile.path}
                  </h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {selectedFile.purpose}
                  </div>
                </div>

                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--accent-color)',
                  fontWeight: 600
                }}>
                  {selectedFile.layer}
                </span>
              </div>

              {/* Code Preview */}
              <div style={{
                background: '#0d1117',
                color: '#c9d1d9',
                padding: '16px',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.85rem',
                overflowX: 'auto',
                border: '1px solid #30363d',
                lineHeight: '1.5'
              }}>
                <pre style={{ margin: 0 }}>{selectedFile.codeSnippet}</pre>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
              Select a file from the source tree to inspect its code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
