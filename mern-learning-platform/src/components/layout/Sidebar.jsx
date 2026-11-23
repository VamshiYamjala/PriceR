import React from 'react';
import { CheckCircle2, Circle, BookOpen, Layers, Server, Shield, Database, Cpu, Compass, HelpCircle } from 'lucide-react';
import { MODULES } from '../../data/modulesData';

const SECTIONS = [
  {
    title: 'Foundations & Architecture',
    icon: Compass,
    moduleIds: [1, 2, 3, 4]
  },
  {
    title: 'Frontend Engineering & React',
    icon: Layers,
    moduleIds: [5, 6, 7]
  },
  {
    title: 'Backend, Express & HTTP',
    icon: Server,
    moduleIds: [8, 9, 10, 11]
  },
  {
    title: 'Authentication & Security',
    icon: Shield,
    moduleIds: [12]
  },
  {
    title: 'MongoDB & Mongoose Engine',
    icon: Database,
    moduleIds: [13, 14]
  },
  {
    title: 'Full-Stack Data Flow Tracing',
    icon: Layers,
    moduleIds: [15, 16]
  },
  {
    title: 'Automation & DevOps',
    icon: Cpu,
    moduleIds: [17, 18, 19]
  },
  {
    title: 'Technical Interview Mastery',
    icon: HelpCircle,
    moduleIds: [20]
  }
];

export default function Sidebar({ activeModuleId, onSelectModule, completedModules = [] }) {
  return (
    <aside style={{
      width: '320px',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      height: 'calc(100vh - 64px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px'
    }}>
      <div style={{
        padding: '0 8px 12px 8px',
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        fontWeight: 800,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em'
      }}>
        Learning Modules Catalog
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {SECTIONS.map((section, sIdx) => {
          const SectionIcon = section.icon;
          const sectionModules = MODULES.filter(m => section.moduleIds.includes(m.id));

          return (
            <div key={sIdx}>
              {/* Section Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-secondary)'
              }}>
                <SectionIcon size={14} color="var(--accent-color)" />
                <span>{section.title}</span>
              </div>

              {/* Module Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                {sectionModules.map(module => {
                  const isActive = module.id === activeModuleId;
                  const isCompleted = completedModules.includes(module.id);

                  return (
                    <button
                      key={module.id}
                      onClick={() => onSelectModule(module.id)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: isActive ? 'var(--bg-card)' : 'transparent',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                        borderLeft: isActive ? '3px solid var(--accent-color)' : '3px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: isActive ? 'var(--accent-color)' : 'var(--text-muted)',
                          minWidth: '22px'
                        }}>
                          {String(module.id).padStart(2, '0')}
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {module.title}
                          </div>
                        </div>
                      </div>

                      {/* Completed badge */}
                      {isCompleted ? (
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                      ) : (
                        <Circle size={14} color="var(--border-color)" style={{ flexShrink: 0 }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
