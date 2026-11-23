import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, HelpCircle, Award, RotateCcw } from 'lucide-react';

export default function QuizModal({ isOpen, onClose, quizData, moduleTitle, onQuizComplete }) {
  if (!isOpen || !quizData) return null;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = quizData.questions || [];
  const currentQ = questions[currentIdx];

  const handleSelect = (optionIdx) => {
    if (selectedAnswers[currentIdx] !== undefined) return; // prevent changing after selecting
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score++;
    });
    return score;
  };

  const handleFinish = () => {
    setShowResults(true);
    if (onQuizComplete) {
      onQuizComplete(calculateScore(), questions.length);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setShowResults(false);
  };

  const score = calculateScore();
  const passed = score >= Math.ceil(questions.length * 0.7);

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
        maxWidth: '680px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
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
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HelpCircle size={22} color="var(--accent-color)" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Knowledge Check: {moduleTitle}
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Question {currentIdx + 1} of {questions.length}
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

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {!showResults ? (
            <div>
              <div style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '20px',
                lineHeight: '1.5'
              }}>
                {currentQ.question}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {currentQ.options.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentIdx] === oIdx;
                  const hasAnswered = selectedAnswers[currentIdx] !== undefined;
                  const isCorrect = oIdx === currentQ.correctAnswer;

                  let optBorder = 'var(--border-color)';
                  let optBg = 'var(--bg-secondary)';
                  let optColor = 'var(--text-primary)';

                  if (hasAnswered) {
                    if (isCorrect) {
                      optBorder = '#10b981';
                      optBg = 'rgba(16, 185, 129, 0.1)';
                      optColor = '#10b981';
                    } else if (isSelected) {
                      optBorder = '#ef4444';
                      optBg = 'rgba(239, 68, 68, 0.1)';
                      optColor = '#ef4444';
                    }
                  } else if (isSelected) {
                    optBorder = 'var(--accent-color)';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelect(oIdx)}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '10px',
                        border: `2px solid ${optBorder}`,
                        background: optBg,
                        color: optColor,
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        cursor: hasAnswered ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <CheckCircle size={18} color="#10b981" />}
                      {hasAnswered && isSelected && !isCorrect && <AlertCircle size={18} color="#ef4444" />}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation */}
              {selectedAnswers[currentIdx] !== undefined && (
                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '10px',
                  background: selectedAnswers[currentIdx] === currentQ.correctAnswer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${selectedAnswers[currentIdx] === currentQ.correctAnswer ? '#10b98133' : '#ef444433'}`
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedAnswers[currentIdx] === currentQ.correctAnswer ? '#10b981' : '#ef4444', marginBottom: '6px' }}>
                    {selectedAnswers[currentIdx] === currentQ.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {currentQ.explanation}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results Screen */
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                background: passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                <Award size={36} color={passed ? '#10b981' : '#ef4444'} />
              </div>
              <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                {passed ? 'Quiz Passed!' : 'Review Recommended'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: '0 0 24px 0' }}>
                You scored <strong>{score}</strong> out of <strong>{questions.length}</strong> ({Math.round((score / questions.length) * 100)}%)
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 600
                  }}
                >
                  <RotateCcw size={16} />
                  Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-color)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Continue Learning
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {!showResults && (
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-secondary)'
          }}>
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                opacity: currentIdx === 0 ? 0.5 : 1
              }}
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                disabled={selectedAnswers[currentIdx] === undefined}
                onClick={() => setCurrentIdx(prev => prev + 1)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--accent-color)',
                  color: '#fff',
                  cursor: selectedAnswers[currentIdx] === undefined ? 'not-allowed' : 'pointer',
                  opacity: selectedAnswers[currentIdx] === undefined ? 0.5 : 1,
                  fontWeight: 600
                }}
              >
                Next Question
              </button>
            ) : (
              <button
                disabled={selectedAnswers[currentIdx] === undefined}
                onClick={handleFinish}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  cursor: selectedAnswers[currentIdx] === undefined ? 'not-allowed' : 'pointer',
                  opacity: selectedAnswers[currentIdx] === undefined ? 0.5 : 1,
                  fontWeight: 600
                }}
              >
                Submit & View Score
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
