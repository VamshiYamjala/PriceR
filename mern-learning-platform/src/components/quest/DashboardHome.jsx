import React from 'react';
import { useGame } from '../../context/GameContext';
import { DEVELOPER_LEVELS } from '../../data/worldsData';
import { ACHIEVEMENTS_DATA } from '../../data/achievementsData';
import {
  Trophy, Flame, Zap, Compass, Swords, Bug,
  FolderTree, GitMerge, FileCode, ArrowRight, Sparkles, CheckCircle2
} from 'lucide-react';

export default function DashboardHome({
  onNavigateView,
  onContinueMission
}) {
  const { player, completedMissions, achievements, bossDefeats, resetProgress } = useGame();

  const nextLevelData = DEVELOPER_LEVELS.find(l => l.level === player.level + 1) || DEVELOPER_LEVELS[DEVELOPER_LEVELS.length - 1];
  const currentLevelData = DEVELOPER_LEVELS.find(l => l.level === player.level) || DEVELOPER_LEVELS[0];

  const xpInCurrentLevel = player.xp - currentLevelData.minXP;
  const xpNeededForNext = nextLevelData.minXP - currentLevelData.minXP;
  const progressPercent = player.level === 10 ? 100 : Math.min(100, Math.round((xpInCurrentLevel / (xpNeededForNext || 1)) * 100));

  const earnedAchievements = ACHIEVEMENTS_DATA.filter(a => achievements.includes(a.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Developer Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
      }}>
        {/* Left: Avatar & Rank */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, var(--accent-color), #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)'
          }}>
            {player.avatar}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <span style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: 'var(--accent-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                Level {player.level}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {player.rank}
              </span>
            </div>

            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Specialization: Full-Stack MERN Architecture • Perks: {currentLevelData.perks}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem' }}>
                <Zap size={16} />
                <span>{player.xp} XP</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem' }}>
                <Flame size={16} />
                <span>{player.streak} Day Streak</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>
                <Trophy size={16} />
                <span>{bossDefeats.length} / 10 Bosses Defeated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Level Progress & CTA */}
        <div style={{ minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Next Rank: <strong>{nextLevelData.title}</strong></span>
            <span style={{ color: 'var(--accent-color)', fontWeight: 700 }}>{progressPercent}%</span>
          </div>

          <div style={{ height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent-color), #8b5cf6)',
              borderRadius: '5px',
              transition: 'width 0.4s ease'
            }} />
          </div>

          <button
            onClick={onContinueMission}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(90deg, var(--accent-color), #2563eb)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)'
            }}
          >
            <span>Continue Next Mission</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Mini-Games & Modes Grid */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--accent-color)" />
          <span>Interactive Training Arenas & Simulators</span>
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Card 1: World Map */}
          <div
            onClick={() => onNavigateView('map')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#3b82f620', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  10-World Campaign Map
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Travel through all MERN architecture zones
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Unlock all 10 worlds, complete missions, and defeat interview bosses to claim master certification.
            </p>
          </div>

          {/* Card 2: Follow The Request Game */}
          <div
            onClick={() => onNavigateView('request_journey')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#10b98120', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GitMerge size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Follow The Request Journey
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  14-Station Full-Stack Simulation
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Watch data packets move from a React button through Axios, Express, middleware, Mongoose, and MongoDB.
            </p>
          </div>

          {/* Card 3: Code Detective */}
          <div
            onClick={() => onNavigateView('detective')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#8b5cf620', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileCode size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Code Detective Lab
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Investigate PriceRadar Source Code
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Explore real PriceRadar files, trace call chains, and find controllers, models, and middleware.
            </p>
          </div>

          {/* Card 4: Architecture Builder */}
          <div
            onClick={() => onNavigateView('architecture_builder')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f59e0b20', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderTree size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Architecture Builder
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Folder & File Organization Puzzle
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Drag and organize full-stack files into their proper directories with instant grading and explanations.
            </p>
          </div>

          {/* Card 5: Debugging Arena */}
          <div
            onClick={() => onNavigateView('debugging_arena')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#ef444420', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bug size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  The Debugging Arena
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Find & Fix 6 Production Bugs
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Inspect hanging middleware, password leaks, floating-point paise bugs, and state mutations.
            </p>
          </div>

          {/* Card 6: Reusable Boilerplate Workshop */}
          <div
            onClick={() => onNavigateView('workshop')}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#06b6d420', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  Build Your Own MERN Workshop
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  12-Step Starter Project Guide
                </div>
              </div>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Step-by-step interactive blueprint to create brand new MERN applications from scratch.
            </p>
          </div>
        </div>
      </div>

      {/* Unlocked Achievements & Reset Footer */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={20} color="#f59e0b" />
            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              Unlocked Achievements ({earnedAchievements.length} / {ACHIEVEMENTS_DATA.length})
            </h4>
          </div>

          <button
            onClick={resetProgress}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Reset Quest Progress
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '6px' }}>
          {ACHIEVEMENTS_DATA.map((ach) => {
            const isEarned = achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                title={ach.description}
                style={{
                  minWidth: '180px',
                  background: isEarned ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  border: isEarned ? '1px solid #f59e0b44' : '1px dashed var(--border-color)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  opacity: isEarned ? 1 : 0.4
                }}
              >
                <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>{ach.badge}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ach.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  +{ach.xpReward} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
