import React, { createContext, useContext, useState, useEffect } from 'react';
import { WORLDS_DATA, DEVELOPER_LEVELS } from '../data/worldsData';
import { ACHIEVEMENTS_DATA } from '../data/achievementsData';

const GameContext = createContext();

const STORAGE_KEY = 'pr_quest_savegame_v2';

const INITIAL_PLAYER = {
  name: 'Developer Cadet',
  avatar: '👨‍💻',
  level: 1,
  xp: 0,
  rank: 'Code Beginner',
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

export function GameProvider({ children }) {
  // Load saved progress or default
  const [player, setPlayer] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.player || INITIAL_PLAYER;
      }
    } catch (e) {
      console.error('Error loading savegame:', e);
    }
    return INITIAL_PLAYER;
  });

  const [completedMissions, setCompletedMissions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).completedMissions || ['m1_1'];
    } catch {}
    return ['m1_1'];
  });

  const [unlockedWorlds, setUnlockedWorlds] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).unlockedWorlds || [1];
    } catch {}
    return [1];
  });

  const [unlockedSkills, setUnlockedSkills] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).unlockedSkills || ['sk_html_js'];
    } catch {}
    return ['sk_html_js'];
  });

  const [achievements, setAchievements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).achievements || ['ach_first_mission'];
    } catch {}
    return ['ach_first_mission'];
  });

  const [bossDefeats, setBossDefeats] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).bossDefeats || [];
    } catch {}
    return [];
  });

  const [toasts, setToasts] = useState([]);

  // Save to localStorage on state changes
  useEffect(() => {
    const saveData = {
      player,
      completedMissions,
      unlockedWorlds,
      unlockedSkills,
      achievements,
      bossDefeats
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  }, [player, completedMissions, unlockedWorlds, unlockedSkills, achievements, bossDefeats]);

  // Recalculate level based on XP
  useEffect(() => {
    let currentLevel = 1;
    let currentRank = 'Code Beginner';
    for (let i = DEVELOPER_LEVELS.length - 1; i >= 0; i--) {
      if (player.xp >= DEVELOPER_LEVELS[i].minXP) {
        currentLevel = DEVELOPER_LEVELS[i].level;
        currentRank = DEVELOPER_LEVELS[i].title;
        break;
      }
    }

    if (currentLevel !== player.level) {
      setPlayer(prev => ({ ...prev, level: currentLevel, rank: currentRank }));
      showToast({
        title: `LEVEL UP! Level ${currentLevel}: ${currentRank}!`,
        message: 'New technologies, skills, and worlds have unlocked!',
        badge: '⚡',
        type: 'levelup'
      });

      // Unlock world corresponding to level
      if (!unlockedWorlds.includes(currentLevel)) {
        setUnlockedWorlds(prev => [...prev, currentLevel]);
      }
    }
  }, [player.xp]);

  const showToast = (toast) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const awardXP = (amount, reason = 'Mission complete') => {
    setPlayer(prev => ({ ...prev, xp: prev.xp + amount }));
    showToast({
      title: `+${amount} XP Earned!`,
      message: reason,
      badge: '✨',
      type: 'xp'
    });
  };

  const completeMission = (missionId, xp = 100) => {
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions(prev => [...prev, missionId]);
      awardXP(xp, `Completed mission: ${missionId}`);
    }
  };

  const unlockAchievement = (achId) => {
    if (!achievements.includes(achId)) {
      const ach = ACHIEVEMENTS_DATA.find(a => a.id === achId);
      if (ach) {
        setAchievements(prev => [...prev, achId]);
        awardXP(ach.xpReward, `Achievement: ${ach.title}`);
        showToast({
          title: `🏆 Achievement Unlocked: ${ach.title}`,
          message: ach.description,
          badge: ach.badge,
          type: 'achievement'
        });
      }
    }
  };

  const defeatBoss = (worldId, rewardXP = 300) => {
    if (!bossDefeats.includes(worldId)) {
      setBossDefeats(prev => [...prev, worldId]);
      awardXP(rewardXP, `Defeated World ${worldId} Interview Boss!`);
      showToast({
        title: `👑 World ${worldId} Interview Boss Conquered!`,
        message: `Outstanding technical explanation! Next world unlocked.`,
        badge: '👑',
        type: 'boss'
      });
      unlockAchievement('ach_first_boss');

      // Unlock next world
      if (worldId < 10 && !unlockedWorlds.includes(worldId + 1)) {
        setUnlockedWorlds(prev => [...prev, worldId + 1]);
      }
    }
  };

  const unlockSkill = (skillId) => {
    if (!unlockedSkills.includes(skillId)) {
      setUnlockedSkills(prev => [...prev, skillId]);
      awardXP(50, `Mastered skill: ${skillId}`);
    }
  };

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset your MERN Quest game progress to Level 1? (Your real PriceRadar code is unaffected).')) {
      localStorage.removeItem(STORAGE_KEY);
      setPlayer(INITIAL_PLAYER);
      setCompletedMissions(['m1_1']);
      setUnlockedWorlds([1]);
      setUnlockedSkills(['sk_html_js']);
      setAchievements(['ach_first_mission']);
      setBossDefeats([]);
      showToast({
        title: 'Game Progress Reset',
        message: 'Welcome back to Level 1, Developer Cadet!',
        badge: '🔄',
        type: 'reset'
      });
    }
  };

  return (
    <GameContext.Provider value={{
      player,
      setPlayer,
      completedMissions,
      unlockedWorlds,
      unlockedSkills,
      achievements,
      bossDefeats,
      awardXP,
      completeMission,
      unlockAchievement,
      defeatBoss,
      unlockSkill,
      resetProgress,
      toasts,
      showToast
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
