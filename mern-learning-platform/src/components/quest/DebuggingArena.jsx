import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { DEBUGGING_CHALLENGES } from '../../data/debuggingChallenges';
import { Bug, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export default function DebuggingArena() {
  const { awardXP, unlockAchievement } = useGame();
  const [activeBugIdx, setActiveBugIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [solvedBugs, setSolvedBugs] = useState([]);

  const currentBug = DEBUGGING_CHALLENGES[activeBugIdx];

  const handleSelectOption = (option) => {
    if (selectedAnswers[currentBug.id]) return; // already answered
    setSelectedAnswers(prev => ({ ...prev, [currentBug.id]: option }));

    if (option.isCorrect) {
      if (!solvedBugs.includes(currentBug.id)) {
        const newSolved = [...solvedBugs, currentBug.id];
        setSolvedBugs(newSolved);
        awardXP(120, `Squashed production bug: ${currentBug.title}!`);
        if (newSolved.length >= 3) {
          unlockAchievement('ach_bug_exterminator');
        }
      }
    }
  };

  const selectedAnswer = selectedAnswers[currentBug.id];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #450a0a, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            background: '#ef4444',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Bug Hunter Arena
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Fixed {solvedBugs.length} of {DEBUGGING_CHALLENGES.length} Production Bugs
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#fff' }}>
          The Debugging Arena: Spot & Fix Production Bugs
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Real production applications encounter real bugs. Inspect broken code snippets below, understand the failure symptoms, and deploy the correct engineering patch.
        </p>
      </div>

      {/* Bug Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {DEBUGGING_CHALLENGES.map((bug, idx) => {
          const isSolved = solvedBugs.includes(bug.id);
          const isActive = idx === activeBugIdx;

          return (
            <button
              key={bug.id}
              onClick={() => setActiveBugIdx(idx)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: isActive ? '2px solid #ef4444' : '1px solid var(--border-color)',
                background: isActive ? 'var(--bg-card)' : isSolved ? '#10b98120' : 'var(--bg-secondary)',
                color: isActive ? '#ef4444' : isSolved ? '#10b981' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              {isSolved ? <CheckCircle2 size={14} color="#10b981" /> : <Bug size={14} />}
              <span>Bug #{idx + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Bug Details Card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ background: '#ef444420', color: '#ef4444', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {currentBug.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Difficulty: {currentBug.difficulty}
              </span>
            </div>
            <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '1.3rem' }}>
              {currentBug.title}
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-color)', fontFamily: 'JetBrains Mono, monospace' }}>
              File: {currentBug.file}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={activeBugIdx === DEBUGGING_CHALLENGES.length - 1}
              onClick={() => setActiveBugIdx(prev => prev + 1)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent-color)',
                color: '#fff',
                cursor: activeBugIdx === DEBUGGING_CHALLENGES.length - 1 ? 'not-allowed' : 'pointer',
                opacity: activeBugIdx === DEBUGGING_CHALLENGES.length - 1 ? 0.4 : 1,
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Next Bug
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Symptom Box */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.85rem', textTransform: 'uppercase' }}>
              Reported Symptom & Stack Trace
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', marginTop: '2px' }}>
              {currentBug.symptom}
            </div>
          </div>
        </div>

        {/* Broken Code Snippet */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px' }}>
            Buggy Code Snippet
          </div>
          <div style={{
            background: '#0d1117',
            color: '#c9d1d9',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.85rem',
            overflowX: 'auto',
            border: '1px solid #30363d'
          }}>
            <pre style={{ margin: 0 }}>{currentBug.brokenCode}</pre>
          </div>
        </div>

        {/* Fix Options */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Choose the correct engineering patch:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentBug.options.map(opt => {
              const isSelected = selectedAnswer?.id === opt.id;
              const hasAnswered = selectedAnswer !== undefined;

              let border = '1px solid var(--border-color)';
              let bg = 'var(--bg-secondary)';
              let color = 'var(--text-primary)';

              if (hasAnswered) {
                if (opt.isCorrect) {
                  border = '2px solid #10b981';
                  bg = 'rgba(16, 185, 129, 0.1)';
                  color = '#10b981';
                } else if (isSelected) {
                  border = '2px solid #ef4444';
                  bg = 'rgba(239, 68, 68, 0.1)';
                  color = '#ef4444';
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border,
                    background: bg,
                    color,
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    cursor: hasAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{opt.text}</span>
                  {hasAnswered && opt.isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                </button>
              );
            })}
          </div>

          {/* Explanation reveal */}
          {selectedAnswer && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              borderRadius: '10px',
              background: selectedAnswer.isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${selectedAnswer.isCorrect ? '#10b98144' : '#ef444444'}`
            }}>
              <div style={{ fontWeight: 700, color: selectedAnswer.isCorrect ? '#10b981' : '#ef4444', marginBottom: '4px', fontSize: '0.9rem' }}>
                {selectedAnswer.isCorrect ? 'Bug Squashed!' : 'Incorrect Patch'}
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {selectedAnswer.explanation}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                <strong>Architect Rule: </strong>{currentBug.fixExplanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
