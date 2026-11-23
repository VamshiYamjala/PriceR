import React from 'react';
import { useGame } from '../../context/GameContext';
import {
  Sun, Moon, Search, BookMarked, Compass, LayoutDashboard,
  GitMerge, FileCode, FolderTree, Bug, Trophy, Hammer, BookOpen, Flame, Zap
} from 'lucide-react';

export default function Navbar({
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenGlossary,
  currentView,
  onNavigateView
}) {
  const { player } = useGame();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'World Map', icon: Compass },
    { id: 'request_journey', label: 'Follow Request', icon: GitMerge },
    { id: 'detective', label: 'Code Detective', icon: FileCode },
    { id: 'architecture_builder', label: 'Arch Builder', icon: FolderTree },
    { id: 'debugging_arena', label: 'Debug Arena', icon: Bug },
    { id: 'skill_tree', label: 'Skill Tree', icon: Trophy },
    { id: 'workshop', label: 'MERN Workshop', icon: Hammer },
    { id: 'modules', label: 'Curriculum', icon: BookOpen }
  ];

  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
      gap: '12px'
    }}>
      {/* Brand & Player Level Badge */}
      <div
        onClick={() => onNavigateView('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: '1.2rem',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          {player.avatar}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>MERN Quest</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b', background: '#f59e0b20', padding: '1px 5px', borderRadius: '4px' }}>
              LVL {player.level}
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {player.rank} • {player.xp} XP
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        overflowX: 'auto',
        maxWidth: '720px'
      }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigateView(item.id)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s'
              }}
            >
              <Icon size={14} color={isActive ? 'var(--accent-color)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Search */}
        <button
          onClick={onOpenSearch}
          title="Search Curriculum (Ctrl+K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            cursor: 'pointer'
          }}
        >
          <Search size={14} color="var(--accent-color)" />
          <span>Search</span>
          <kbd style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '1px 4px', fontSize: '0.65rem' }}>
            Ctrl K
          </kbd>
        </button>

        {/* Glossary */}
        <button
          onClick={onOpenGlossary}
          title="Open MERN Glossary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <BookMarked size={14} color="#f59e0b" />
          <span>Glossary</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '7px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#6366f1" />}
        </button>
      </div>
    </header>
  );
}
