import React, { useState } from 'react';
import { WORLDS_DATA } from '../../data/worldsData';
import { useGame } from '../../context/GameContext';
import { Lock, Unlock, CheckCircle2, ChevronRight, Swords, Compass, Sparkles, Trophy } from 'lucide-react';

export default function WorldMap({ onSelectMission, onFightBoss }) {
  const { player, unlockedWorlds, completedMissions, bossDefeats } = useGame();
  const [activeWorldId, setActiveWorldId] = useState(1);

  const activeWorld = WORLDS_DATA.find(w => w.id === activeWorldId) || WORLDS_DATA[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Map Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1e38, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '28px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              Campaign Map
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Level {player.level} • {player.rank}
            </span>
          </div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', color: '#fff', fontWeight: 800 }}>
            MERN STACK DEVELOPER QUEST
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
            Travel through the 10 Realms of Full-Stack Architecture. Complete missions, trace requests, conquer code challenges, and defeat technical interview bosses to become a production-ready MERN Architect.
          </p>
        </div>
      </div>

      {/* World Map Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {WORLDS_DATA.map((world) => {
          const isUnlocked = unlockedWorlds.includes(world.id);
          const isSelected = activeWorldId === world.id;
          const isBossDefeated = bossDefeats.includes(world.id);
          const completedCount = world.missions.filter(m => completedMissions.includes(m.id)).length;
          const totalMissions = world.missions.length;
          const WorldIcon = world.icon;

          return (
            <div
              key={world.id}
              onClick={() => { if (isUnlocked) setActiveWorldId(world.id); }}
              style={{
                background: isSelected ? 'var(--bg-card)' : 'var(--bg-secondary)',
                border: isSelected ? `2px solid ${world.color}` : '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px',
                cursor: isUnlocked ? 'pointer' : 'not-allowed',
                opacity: isUnlocked ? 1 : 0.6,
                position: 'relative',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 0 20px ${world.color}33` : 'none'
              }}
            >
              {/* World Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isUnlocked ? `${world.color}20` : 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isUnlocked ? world.color : 'var(--text-muted)'
                }}>
                  <WorldIcon size={20} />
                </div>

                {isBossDefeated ? (
                  <span style={{ background: '#10b98120', color: '#10b981', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
                    CONQUERED
                  </span>
                ) : isUnlocked ? (
                  <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {completedCount}/{totalMissions} Done
                  </span>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Lock size={12} />
                    <span>Lvl {world.requiredLevel}</span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '0.75rem', color: isUnlocked ? world.color : 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                World {world.id}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '4px 0 6px 0' }}>
                {world.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4', height: '36px', overflow: 'hidden' }}>
                {world.subtitle}
              </div>

              {/* Progress bar */}
              {isUnlocked && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${(completedCount / totalMissions) * 100}%`,
                      background: world.color
                    }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected World Focus Panel */}
      {activeWorld && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 4px 25px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: `${activeWorld.color}20`,
                  color: activeWorld.color,
                  fontSize: '0.8rem',
                  fontWeight: 800
                }}>
                  World {activeWorld.id} Selected
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {activeWorld.subtitle}
                </span>
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '1.6rem', color: 'var(--text-primary)' }}>
                {activeWorld.name}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '680px' }}>
                {activeWorld.description}
              </p>
            </div>

            {/* Boss Challenge Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b, #311042)',
              border: '1px solid #6366f155',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ fontSize: '2rem' }}>{activeWorld.boss.avatar}</div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
                  World Boss Encounter
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                  {activeWorld.boss.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#c7d2fe' }}>
                  {activeWorld.boss.title}
                </div>
              </div>

              <button
                onClick={() => onFightBoss(activeWorld)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: bossDefeats.includes(activeWorld.id) ? '#10b981' : 'linear-gradient(90deg, #ef4444, #f59e0b)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }}
              >
                <Swords size={16} />
                {bossDefeats.includes(activeWorld.id) ? 'Replay Boss' : 'Challenge Boss'}
              </button>
            </div>
          </div>

          {/* Missions List */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)', fontSize: '1.1rem' }}>
              World Learning Missions ({activeWorld.missions.length})
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
              {activeWorld.missions.map((mission, idx) => {
                const isCompleted = completedMissions.includes(mission.id);

                return (
                  <div
                    key={mission.id}
                    onClick={() => onSelectMission(mission.moduleId, mission)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: isCompleted ? '1px solid #10b98144' : '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: isCompleted ? '#10b98120' : 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isCompleted ? '#10b981' : 'var(--text-muted)'
                      }}>
                        {isCompleted ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                      </div>

                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {mission.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <span style={{ color: activeWorld.color, fontWeight: 600 }}>+{mission.xp} XP</span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>{mission.type} Lab</span>
                          <span>•</span>
                          <span>Module {mission.moduleId}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
