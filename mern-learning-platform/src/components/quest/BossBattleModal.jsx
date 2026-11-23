import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { X, Swords, ShieldCheck, Trophy, Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function BossBattleModal({ isOpen, onClose, world }) {
  if (!isOpen || !world) return null;

  const { defeatBoss } = useGame();
  const boss = world.boss;

  const [userAnswer, setUserAnswer] = useState('');
  const [bossHP, setBossHP] = useState(boss.hp);
  const [evaluated, setEvaluated] = useState(false);
  const [damageDealt, setDamageDealt] = useState(0);
  const [feedback, setFeedback] = useState([]);

  const handleAttack = () => {
    if (!userAnswer.trim()) return;

    const lowerAnswer = userAnswer.toLowerCase();
    let hitCount = 0;
    const matched = [];
    const missed = [];

    boss.keywords.forEach(kw => {
      if (lowerAnswer.includes(kw.toLowerCase())) {
        hitCount++;
        matched.push(kw);
      } else {
        missed.push(kw);
      }
    });

    const keywordRatio = hitCount / boss.keywords.length;
    // Length bonus (up to 30% if answer is thorough > 150 chars)
    const lengthBonus = Math.min(0.3, userAnswer.length / 500);
    const scoreFraction = Math.min(1.0, keywordRatio * 0.8 + lengthBonus);

    const damage = Math.round(boss.hp * scoreFraction);
    const remainingHP = Math.max(0, boss.hp - damage);

    setDamageDealt(damage);
    setBossHP(remainingHP);
    setEvaluated(true);

    const feedbackNotes = [];
    if (matched.length > 0) {
      feedbackNotes.push(`Hit with critical concepts: ${matched.slice(0, 5).join(', ')}.`);
    }
    if (missed.length > 0 && remainingHP > 0) {
      feedbackNotes.push(`Missed architectural terms: ${missed.slice(0, 4).join(', ')}.`);
    }

    setFeedback(feedbackNotes);

    if (remainingHP === 0) {
      defeatBoss(world.id, boss.rewardXP);
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setBossHP(boss.hp);
    setEvaluated(false);
    setDamageDealt(0);
    setFeedback([]);
  };

  const isVictorious = bossHP === 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(6px)',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        width: '100%',
        maxWidth: '720px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e1b4b, #2e0854)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '2rem' }}>{boss.avatar}</div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                World {world.id} Boss Battle
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>
                {boss.name}: {boss.title}
              </h3>
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

        {/* Boss HP Bar */}
        <div style={{ padding: '16px 24px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Boss Health Points (HP)</span>
            <span style={{ color: bossHP > 0 ? '#ef4444' : '#10b981', fontWeight: 800 }}>
              {bossHP} / {boss.hp} HP
            </span>
          </div>
          <div style={{ height: '12px', background: 'var(--bg-card)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{
              width: `${(bossHP / boss.hp) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>

        {/* Battle Arena Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Boss Question */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '12px',
            padding: '18px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '4px' }}>
              Technical Interview Challenge
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.5' }}>
              "{boss.question}"
            </div>
          </div>

          {!isVictorious ? (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Type your comprehensive answer below. Include core architectural terms, execution order, and trade-offs to strike maximum damage!
              </div>

              <textarea
                rows={5}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Example: When a user triggers this action, the browser dispatches an Axios call to Express router..."
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              {/* Feedback Alert */}
              {evaluated && (
                <div style={{
                  marginTop: '12px',
                  padding: '14px',
                  borderRadius: '8px',
                  background: damageDealt > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                    Dealt -{damageDealt} HP damage!
                  </div>
                  {feedback.map((f, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      • {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Victory Screen */
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
              border: '2px solid #10b981',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <Trophy size={48} color="#10b981" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ margin: '0 0 6px 0', color: '#10b981', fontSize: '1.4rem' }}>
                VICTORY! BOSS CONQUERED!
              </h3>
              <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                You have defeated {boss.name} and conquered World {world.id}! +{boss.rewardXP} XP has been awarded to your developer profile.
              </p>

              {/* Model Answer Showcase */}
              <div style={{ marginTop: '20px', textAlign: 'left', background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', marginBottom: '6px' }}>
                  Master Model Interview Answer
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {boss.modelAnswer}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem'
            }}
          >
            <RotateCcw size={14} />
            Try Again
          </button>

          {!isVictorious ? (
            <button
              onClick={handleAttack}
              disabled={!userAnswer.trim()}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(90deg, #ef4444, #f59e0b)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: userAnswer.trim() ? 'pointer' : 'not-allowed',
                opacity: userAnswer.trim() ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
              }}
            >
              <Swords size={18} />
              Strike with Answer!
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#10b981',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Continue Quest
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
