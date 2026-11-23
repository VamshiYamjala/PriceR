import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ModuleViewer from './components/layout/ModuleViewer';
import QuizModal from './components/common/QuizModal';
import SearchModal from './components/common/SearchModal';
import GlossaryModal from './components/common/GlossaryModal';

// Quest Components
import DashboardHome from './components/quest/DashboardHome';
import WorldMap from './components/quest/WorldMap';
import FollowTheRequestGame from './components/quest/FollowTheRequestGame';
import CodeDetectiveGame from './components/quest/CodeDetectiveGame';
import ArchitectureBuilderGame from './components/quest/ArchitectureBuilderGame';
import DebuggingArena from './components/quest/DebuggingArena';
import SkillTree from './components/quest/SkillTree';
import BoilerplateWorkshop from './components/quest/BoilerplateWorkshop';
import BossBattleModal from './components/quest/BossBattleModal';
import ToastsOverlay from './components/quest/ToastsOverlay';

import { MODULES } from './data/modulesData';
import { QUIZZES } from './data/quizzesData';

function QuestApp() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pr_mern_theme') || 'dark';
  });

  // Current Screen / View
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('pr_mern_view') || 'dashboard';
  });

  // Active Educational Module (1 to 20)
  const [activeModuleId, setActiveModuleId] = useState(1);

  // Modal States
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [glossaryTerm, setGlossaryTerm] = useState('');
  const [bossBattleWorld, setBossBattleWorld] = useState(null);

  const { completedMissions, completeMission } = useGame();

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pr_mern_theme', theme);
  }, [theme]);

  // Sync view
  useEffect(() => {
    localStorage.setItem('pr_mern_view', currentView);
  }, [currentView]);

  // Ctrl+K Global Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLaunchMission = (moduleId, mission) => {
    setActiveModuleId(moduleId);
    setCurrentView('modules');
  };

  const handleFightBoss = (world) => {
    setBossBattleWorld(world);
  };

  const activeModule = MODULES.find(m => m.id === activeModuleId) || MODULES[0];
  const activeQuiz = QUIZZES[activeModuleId];

  // Render current view content
  const renderViewContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <DashboardHome
              onNavigateView={(v) => setCurrentView(v)}
              onContinueMission={() => { setActiveModuleId(1); setCurrentView('map'); }}
            />
          </div>
        );

      case 'map':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <WorldMap
              onSelectMission={handleLaunchMission}
              onFightBoss={handleFightBoss}
            />
          </div>
        );

      case 'request_journey':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <FollowTheRequestGame />
          </div>
        );

      case 'detective':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <CodeDetectiveGame />
          </div>
        );

      case 'architecture_builder':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <ArchitectureBuilderGame />
          </div>
        );

      case 'debugging_arena':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <DebuggingArena />
          </div>
        );

      case 'skill_tree':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <SkillTree />
          </div>
        );

      case 'workshop':
        return (
          <div style={{ flex: 1, height: 'calc(100vh - 64px)', overflowY: 'auto', padding: '28px 36px', background: 'var(--bg-primary)' }}>
            <BoilerplateWorkshop />
          </div>
        );

      case 'modules':
      default:
        return (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar
              activeModuleId={activeModuleId}
              onSelectModule={(id) => setActiveModuleId(id)}
              completedModules={completedMissions}
            />

            <ModuleViewer
              module={activeModule}
              isCompleted={completedMissions.includes(activeModuleId)}
              onToggleComplete={(id) => completeMission(id, 100)}
              onOpenQuiz={() => setIsQuizOpen(true)}
              onPrevModule={() => activeModuleId > 1 && setActiveModuleId(prev => prev - 1)}
              onNextModule={() => activeModuleId < MODULES.length && setActiveModuleId(prev => prev + 1)}
              hasPrev={activeModuleId > 1}
              hasNext={activeModuleId < MODULES.length}
            />
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenGlossary={() => { setGlossaryTerm(''); setIsGlossaryOpen(true); }}
        currentView={currentView}
        onNavigateView={(v) => setCurrentView(v)}
      />

      {renderViewContent()}

      {/* Overlays & Modals */}
      <ToastsOverlay />

      <BossBattleModal
        isOpen={Boolean(bossBattleWorld)}
        onClose={() => setBossBattleWorld(null)}
        world={bossBattleWorld}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        quizData={activeQuiz}
        moduleTitle={activeModule.title}
        onQuizComplete={(score, total) => {
          if (score >= Math.ceil(total * 0.7)) {
            completeMission(activeModuleId, 150);
          }
        }}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectModule={(id) => {
          setActiveModuleId(id);
          setCurrentView('modules');
        }}
        onOpenGlossary={(term) => {
          setGlossaryTerm(term);
          setIsGlossaryOpen(true);
        }}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        initialTerm={glossaryTerm}
      />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <QuestApp />
    </GameProvider>
  );
}
