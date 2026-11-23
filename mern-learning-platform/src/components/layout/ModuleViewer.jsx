import React, { useState } from 'react';
import {
  BookOpen, Sparkles, Code2, AlertTriangle, HelpCircle,
  CheckCircle2, ArrowLeft, ArrowRight, Play, ExternalLink, ShieldCheck
} from 'lucide-react';

// Import All Simulators
import ArchitectureExplorer from '../simulators/ArchitectureExplorer';
import FolderExplorer from '../simulators/FolderExplorer';
import StartupSequencer from '../simulators/StartupSequencer';
import AxiosSimulator from '../simulators/AxiosSimulator';
import EndpointExplorer from '../simulators/EndpointExplorer';
import RequestInspector from '../simulators/RequestInspector';
import MiddlewarePipeline from '../simulators/MiddlewarePipeline';
import JwtSimulator from '../simulators/JwtSimulator';
import DatabaseVisualizer from '../simulators/DatabaseVisualizer';
import CrudSimulator from '../simulators/CrudSimulator';
import FileConnectionMap from '../simulators/FileConnectionMap';
import RequestWalkthrough from '../simulators/RequestWalkthrough';
import WhereToPutCodeWizard from '../simulators/WhereToPutCodeWizard';

export default function ModuleViewer({
  module,
  isCompleted,
  onToggleComplete,
  onOpenQuiz,
  onPrevModule,
  onNextModule,
  hasPrev,
  hasNext
}) {
  const [activeTab, setActiveTab] = useState('interactive'); // default to interactive for hands-on learning

  // Resolve which interactive component to mount based on module ID
  const renderInteractiveComponent = () => {
    switch (module.id) {
      case 1:
      case 4:
        return <ArchitectureExplorer />;
      case 2:
      case 3:
        return <FolderExplorer />;
      case 5:
      case 8:
        return <StartupSequencer />;
      case 6:
      case 11:
        return <AxiosSimulator />;
      case 7:
        return <FolderExplorer />;
      case 9:
        return <EndpointExplorer />;
      case 10:
        return <RequestInspector />;
      case 11:
        return <MiddlewarePipeline />;
      case 12:
        return <JwtSimulator />;
      case 13:
        return <DatabaseVisualizer />;
      case 14:
        return <CrudSimulator />;
      case 15:
        return <FileConnectionMap />;
      case 16:
        return <RequestWalkthrough />;
      case 17:
      case 18:
        return <RequestWalkthrough />;
      case 19:
        return <WhereToPutCodeWizard />;
      case 20:
      default:
        return <WhereToPutCodeWizard />;
    }
  };

  const tabs = [
    { id: 'interactive', label: 'Interactive Lab & Simulator', icon: Play },
    { id: 'concept', label: '1. Concept & Analogy', icon: Sparkles },
    { id: 'code', label: '2. PriceRadar Implementation', icon: Code2 },
    { id: 'traps', label: '3. Common Traps & Fixes', icon: AlertTriangle },
    { id: 'interview', label: '4. Interview Q&A', icon: HelpCircle }
  ];

  return (
    <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-primary)' }}>
      {/* Module Header */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '28px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-color)',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                Module {module.id}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                • 15-20 min mastery
              </span>
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 800 }}>
              {module.title}
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '750px', lineHeight: '1.5' }}>
              {module.summary}
            </p>
          </div>

          {/* Action Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onOpenQuiz}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--accent-color)',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--accent-color)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <HelpCircle size={16} />
              Take Module Quiz
            </button>

            <button
              onClick={() => onToggleComplete(module.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: isCompleted ? '#10b981' : 'var(--bg-secondary)',
                color: isCompleted ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isCompleted ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
              }}
            >
              <CheckCircle2 size={16} />
              {isCompleted ? 'Completed' : 'Mark as Done'}
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '16px',
          overflowX: 'auto'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: isTabActive ? '1px solid var(--accent-color)' : '1px solid transparent',
                  background: isTabActive ? 'var(--bg-secondary)' : 'transparent',
                  color: isTabActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: isTabActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} color={isTabActive ? 'var(--accent-color)' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Interactive Lab & Simulator */}
      {activeTab === 'interactive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Play size={20} color="var(--accent-color)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                Hands-On Interactive Simulator
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Interact with the live simulator below to experience how data moves and code executes in this layer of the stack.
              </div>
            </div>
          </div>

          {renderInteractiveComponent()}
        </div>
      )}

      {/* Tab 2: Concept & Real-Life Analogy */}
      {activeTab === 'concept' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Beginner Analogy Card */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sparkles size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, color: '#f59e0b', fontSize: '1.1rem' }}>
                Everyday Real-Life Analogy
              </h3>
            </div>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {module.analogy}
            </p>
          </div>

          {/* Core Concept Breakdown */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Core Technical Concept
            </h3>
            <div style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
              {module.coreConcept}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: PriceRadar Implementation */}
      {activeTab === 'code' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Code2 size={20} color="var(--accent-color)" />
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                How It Is Implemented in PriceRadar
              </h3>
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {module.priceRadarImpl}
            </div>

            {module.codeSnippet && (
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '8px' }}>
                  Source Code Reference:
                </div>
                <div style={{
                  background: '#0d1117',
                  color: '#c9d1d9',
                  padding: '18px',
                  borderRadius: '10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.85rem',
                  overflowX: 'auto',
                  border: '1px solid #30363d'
                }}>
                  <pre style={{ margin: 0 }}>{module.codeSnippet}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Common Traps & Mistakes */}
      {activeTab === 'traps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {module.traps && module.traps.map((trap, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ef4444' }}>
                <AlertTriangle size={18} />
                <h4 style={{ margin: 0, fontSize: '1rem' }}>
                  Trap {idx + 1}: {trap.mistake}
                </h4>
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '12px' }}>
                <strong>Why it breaks: </strong>{trap.why}
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '12px 16px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem'
              }}>
                <strong style={{ color: '#10b981' }}>How to fix it: </strong>{trap.fix}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Technical Interview Q&A */}
      {activeTab === 'interview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: 'var(--bg-secondary)',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <ShieldCheck size={20} color="var(--accent-color)" />
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Practice speaking these exact answers aloud. They are structured with clear bullet points and real-world project credibility.
            </div>
          </div>

          {module.interviewQA && module.interviewQA.map((qa, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px'
              }}
            >
              <h4 style={{ margin: '0 0 12px 0', color: 'var(--accent-color)', fontSize: '1.05rem', display: 'flex', gap: '8px' }}>
                <span>Q{idx + 1}:</span>
                <span>{qa.question}</span>
              </h4>

              <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {qa.answer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Module Navigation */}
      <div style={{
        marginTop: '40px',
        paddingTop: '24px',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          disabled={!hasPrev}
          onClick={onPrevModule}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            cursor: hasPrev ? 'pointer' : 'not-allowed',
            opacity: hasPrev ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <ArrowLeft size={16} />
          Previous Module
        </button>

        <button
          disabled={!hasNext}
          onClick={onNextModule}
          style={{
            padding: '10px 22px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--accent-color)',
            color: '#fff',
            cursor: hasNext ? 'pointer' : 'not-allowed',
            opacity: hasNext ? 1 : 0.4,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}
        >
          Next Module
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
