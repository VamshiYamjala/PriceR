import React from 'react';
import { useGame } from '../../context/GameContext';

export default function ToastsOverlay() {
  const { toasts } = useGame();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '76px',
      right: '24px',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
            border: '2px solid #8b5cf6',
            borderRadius: '12px',
            padding: '14px 18px',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '280px',
            maxWidth: '380px',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ fontSize: '1.8rem' }}>{toast.badge || '✨'}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b' }}>
              {toast.title}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '2px' }}>
              {toast.message}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
