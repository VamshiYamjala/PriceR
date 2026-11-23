import React from 'react';
import { useGame } from '../../context/GameContext';
import { SKILLS_TREE_DATA } from '../../data/skillsTreeData';
import { Lock, Unlock, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

export default function SkillTree() {
  const { player, unlockedSkills, unlockSkill } = useGame();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b, #0f172a)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            background: 'var(--accent-color)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 800,
            textTransform: 'uppercase'
          }}>
            Skill Tree Mastery
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {unlockedSkills.length} Skills Mastered
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '1.6rem', color: '#fff' }}>
          Full-Stack Architect Skill Tree
        </h2>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Master key competencies across Frontend, Backend, Database, Security, and DevOps. Prerequisites must be satisfied to unlock higher-tier architecture capabilities.
        </p>
      </div>

      {/* Branches Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SKILLS_TREE_DATA.map((branch, bIdx) => (
          <div
            key={bIdx}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: branch.color }} />
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                {branch.category}
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '14px'
            }}>
              {branch.skills.map((skill) => {
                const isUnlocked = unlockedSkills.includes(skill.id);
                // Check if all dependencies are unlocked
                const dependenciesMet = !skill.dependsOn || skill.dependsOn.every(dep => unlockedSkills.includes(dep));
                const canUnlock = !isUnlocked && dependenciesMet && player.level >= skill.level;

                return (
                  <div
                    key={skill.id}
                    style={{
                      background: isUnlocked ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                      border: isUnlocked ? `2px solid ${branch.color}` : canUnlock ? '1px dashed var(--accent-color)' : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '16px',
                      opacity: isUnlocked || canUnlock ? 1 : 0.5,
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '1.6rem' }}>{skill.icon}</span>
                        {isUnlocked ? (
                          <CheckCircle2 size={18} color="#10b981" />
                        ) : canUnlock ? (
                          <span style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: 700 }}>
                            READY
                          </span>
                        ) : (
                          <Lock size={14} color="var(--text-muted)" />
                        )}
                      </div>

                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {skill.name}
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        {skill.desc}
                      </div>
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                      {isUnlocked ? (
                        <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                          ✓ Mastered
                        </div>
                      ) : canUnlock ? (
                        <button
                          onClick={() => unlockSkill(skill.id)}
                          style={{
                            width: '100%',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: branch.color,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <Zap size={14} />
                          Unlock Skill (+50 XP)
                        </button>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Requires Level {skill.level} {skill.dependsOn ? `& ${skill.dependsOn.join(', ')}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
