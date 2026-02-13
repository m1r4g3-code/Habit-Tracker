import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Habit, XPValue, AppState, Mood } from './types';
import { loadAllState, checkDailyReset, calculateXPForNextLevel } from './services/storageService';
import { getTodayKey } from './lib/date';
import { saveToStorage } from './lib/storage';
import { STORAGE_KEYS } from './constants';
import { HabitCard } from './components/HabitCard';
import { Button } from './components/ui/Button';
import { ProgressBar } from './components/ui/ProgressBar';
import { CreateHabitModal } from './components/CreateHabitModal';
import { LevelUpModal } from './components/LevelUpModal';
import { MoodCheckInModal } from './components/MoodCheckInModal';

const MOOD_ACCENTS: Record<string, string> = {
  focused: 'from-emerald-900/10',
  good: 'from-blue-900/10',
  neutral: 'from-neutral-800/10',
  frustrated: 'from-orange-900/10',
  low_energy: 'from-purple-900/10',
};

const MOOD_MICROCOPY: Record<string, string> = {
  focused: "Time to crush your goals.",
  good: "Keep the momentum flowing.",
  neutral: "Consistency is key.",
  frustrated: "Deep breath. One step at a time.",
  low_energy: "Be kind to yourself today.",
};

const App: React.FC = () => {
  // --- State ---
  // Start with loading true and empty data to avoid hydration mismatch
  const [state, setState] = useState<AppState>({
    profile: { name: 'Hero', currentLevel: 1, currentXP: 0, totalLifetimeXP: 0, lastActiveDate: new Date().toISOString() },
    habits: [],
    completions: {},
    moods: {},
    streak: { currentStreak: 0, longestStreak: 0, lastCompletionDate: null, streakStartDate: null },
    isLoading: true,
  });
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(0);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);

  // --- Derived State ---
  const todayLogicDate = useMemo(() => getTodayKey(), []);
  const todaysCompletions = useMemo(() => state.completions[todayLogicDate] || [], [state.completions, todayLogicDate]);
  
  const xpForNextLevel = calculateXPForNextLevel(state.profile.currentLevel);
  const todaysMood = state.moods?.[todayLogicDate];

  // --- Hydration Effect ---
  useEffect(() => {
    const hydrate = () => {
      const loaded = loadAllState();
      const processed = checkDailyReset(loaded);
      setState(processed);
    };
    hydrate();
  }, []);

  // --- Persistence Effects ---
  
  // Save Habits
  useEffect(() => {
    if (!state.isLoading) {
      saveToStorage(STORAGE_KEYS.HABITS, state.habits);
    }
  }, [state.habits, state.isLoading]);

  // Save Stats (Profile, Completions, Mood History, Streak)
  useEffect(() => {
    if (!state.isLoading) {
      saveToStorage(STORAGE_KEYS.STATS, {
        profile: state.profile,
        completions: state.completions,
        moods: state.moods,
        streak: state.streak
      });
    }
  }, [state.profile, state.completions, state.moods, state.streak, state.isLoading]);

  // Save Mood Check-In State (Specific requirement)
  useEffect(() => {
    if (!state.isLoading && todaysMood) {
      saveToStorage(STORAGE_KEYS.MOOD, { date: todayLogicDate, mood: todaysMood });
    }
  }, [todaysMood, todayLogicDate, state.isLoading]);

  // Check for mood check-in requirement
  useEffect(() => {
    if (!state.isLoading) {
      // Check specific mood storage requirement
      const storedMood = localStorage.getItem(STORAGE_KEYS.MOOD);
      let needsCheckIn = true;

      if (storedMood) {
        try {
          const parsed = JSON.parse(storedMood);
          if (parsed.date === todayLogicDate) {
            needsCheckIn = false;
          }
        } catch (e) {
          // ignore error, treat as missing
        }
      }

      // Also check internal state just in case
      if (state.moods[todayLogicDate]) {
        needsCheckIn = false;
      }

      if (needsCheckIn) {
        setIsMoodModalOpen(true);
      }
    }
  }, [todayLogicDate, state.moods, state.isLoading]);

  // --- Handlers ---

  const handleMoodSubmit = (mood: Mood) => {
    setState(prev => ({
      ...prev,
      moods: {
        ...prev.moods,
        [todayLogicDate]: mood
      }
    }));
    setIsMoodModalOpen(false);
  };

  const handleCreateHabit = (name: string, xpValue: XPValue, id?: string) => {
    if (id) {
      // Edit
      setState(prev => ({
        ...prev,
        habits: prev.habits.map(h => h.id === id ? { ...h, name, xpValue } : h)
      }));
    } else {
      // Create
      const newHabit: Habit = {
        id: uuidv4(),
        name,
        xpValue,
        createdAt: new Date().toISOString(),
        isArchived: false,
      };
      setState(prev => ({
        ...prev,
        habits: [...prev.habits, newHabit]
      }));
    }
  };

  const handleDeleteHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id)
    }));
  };

  const handleCompleteHabit = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    const isAlreadyCompleted = todaysCompletions.some(c => c.habitId === habitId);
    if (isAlreadyCompleted) return;

    setState(prev => {
      const currentXP = prev.profile.currentXP + habit.xpValue;
      const totalLifetimeXP = prev.profile.totalLifetimeXP + habit.xpValue;
      let currentLevel = prev.profile.currentLevel;
      let nextLevelXP = calculateXPForNextLevel(currentLevel);
      
      let leveledUp = false;
      let newCurrentXP = currentXP;

      while (newCurrentXP >= nextLevelXP) {
        leveledUp = true;
        newCurrentXP -= nextLevelXP;
        currentLevel++;
        nextLevelXP = calculateXPForNextLevel(currentLevel);
      }

      if (leveledUp) {
        setLevelUpLevel(currentLevel);
        setShowLevelUp(true);
      }

      const newCompletion = {
        habitId,
        completedAt: new Date().toISOString(),
        xpGained: habit.xpValue
      };
      
      const updatedCompletions = {
        ...prev.completions,
        [todayLogicDate]: [...(prev.completions[todayLogicDate] || []), newCompletion]
      };

      const newStreakData = { ...prev.streak };
      const hadCompletionToday = prev.completions[todayLogicDate]?.length > 0;
      
      if (!hadCompletionToday) {
        if (newStreakData.currentStreak === 0) {
           newStreakData.currentStreak = 1;
           newStreakData.streakStartDate = todayLogicDate;
        } else {
           newStreakData.currentStreak += 1;
        }
      }
      
      if (newStreakData.currentStreak > newStreakData.longestStreak) {
        newStreakData.longestStreak = newStreakData.currentStreak;
      }
      newStreakData.lastCompletionDate = new Date().toISOString();

      return {
        ...prev,
        profile: {
          ...prev.profile,
          currentLevel,
          currentXP: newCurrentXP,
          totalLifetimeXP,
        },
        completions: updatedCompletions,
        streak: newStreakData,
      };
    });
  };

  const openEditModal = (habit: Habit) => {
    setEditingHabit(habit);
    setIsCreateModalOpen(true);
  };

  // --- Render ---

  if (state.isLoading) return null;

  const activeHabits = state.habits.filter(h => !h.isArchived);
  const incompleteHabits = activeHabits.filter(h => !todaysCompletions.some(c => c.habitId === h.id));
  const completedHabits = activeHabits.filter(h => todaysCompletions.some(c => c.habitId === h.id));

  const moodBgClass = todaysMood ? (MOOD_ACCENTS[todaysMood] || 'from-transparent') : 'from-transparent';
  const moodMicrocopy = todaysMood ? MOOD_MICROCOPY[todaysMood] : "Let's make today count.";

  return (
    <div className={`min-h-screen bg-bg-base text-white font-sans selection:bg-accent-primary/30 transition-colors duration-1000 bg-gradient-to-b ${moodBgClass} to-bg-base to-30%`}>
      
      <main className="max-w-md mx-auto min-h-screen flex flex-col p-6 relative">
        
        {/* Profile Header */}
        <header className="mb-8 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs font-bold text-accent-secondary uppercase tracking-wider mb-1">
                {state.profile.name}
              </div>
              <h1 className="text-3xl font-bold flex items-baseline gap-2">
                Level {state.profile.currentLevel}
                <span className="text-sm font-normal text-neutral-500 font-mono">
                  {state.profile.totalLifetimeXP.toLocaleString()} XP
                </span>
              </h1>
              <p className="text-sm text-neutral-400 mt-2 font-medium animate-fade-in">
                {moodMicrocopy}
              </p>
            </div>
            
            <div className="flex flex-col items-end">
               <div className="flex items-center gap-1.5 bg-bg-elevated border border-neutral-800 px-3 py-1.5 rounded-lg shadow-sm">
                 <span className="text-xl">🔥</span>
                 <span className="font-bold text-lg font-mono">{state.streak.currentStreak}</span>
               </div>
               <div className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wide">Streak</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-neutral-400">
              <span>{Math.round(state.profile.currentXP)} XP</span>
              <span>{xpForNextLevel} XP next</span>
            </div>
            <ProgressBar current={state.profile.currentXP} max={xpForNextLevel} />
          </div>
        </header>

        {/* Habits Lists */}
        <div className="flex-1 space-y-8">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-semibold text-white">Today's Tasks</h2>
               <span className="text-xs text-neutral-500 bg-neutral-900 px-2 py-1 rounded-md">{incompleteHabits.length} left</span>
            </div>
            
            {incompleteHabits.length === 0 && activeHabits.length > 0 && (
               <div className="text-center py-10 border border-dashed border-neutral-800 rounded-xl bg-bg-elevated/30">
                 <div className="text-2xl mb-2">🎉</div>
                 <p className="text-neutral-400">All habits completed!</p>
               </div>
            )}

            {activeHabits.length === 0 && (
               <div className="text-center py-12 px-6">
                 <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl border border-neutral-800 text-neutral-600">
                    🌱
                 </div>
                 <h3 className="text-lg font-medium text-white mb-2">Start Your Journey</h3>
                 <p className="text-neutral-500 text-sm mb-6">Create your first habit to begin leveling up your life.</p>
                 <Button onClick={() => { setEditingHabit(null); setIsCreateModalOpen(true); }}>
                    Create First Habit
                 </Button>
               </div>
            )}

            {incompleteHabits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                isCompleted={false} 
                onComplete={handleCompleteHabit}
                onEdit={openEditModal}
              />
            ))}
          </div>

          {completedHabits.length > 0 && (
            <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
              <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-widest pl-1">Completed</h2>
              {completedHabits.map(habit => (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  isCompleted={true} 
                  onComplete={() => {}} 
                  onEdit={openEditModal}
                  disabled
                />
              ))}
            </div>
          )}
        </div>

        {activeHabits.length > 0 && (
          <div className="fixed bottom-6 right-6 lg:absolute lg:bottom-6 lg:right-0">
             <Button 
               size="lg" 
               className="rounded-full w-14 h-14 !p-0 shadow-xl shadow-accent-primary/20 text-2xl pb-1"
               onClick={() => { setEditingHabit(null); setIsCreateModalOpen(true); }}
             >
               +
             </Button>
          </div>
        )}

      </main>

      {/* --- Modals --- */}
      <CreateHabitModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateHabit}
        onDelete={handleDeleteHabit}
        editingHabit={editingHabit}
      />

      <LevelUpModal 
        isOpen={showLevelUp} 
        level={levelUpLevel} 
        onClose={() => setShowLevelUp(false)} 
      />

      <MoodCheckInModal 
        isOpen={isMoodModalOpen}
        onSubmit={handleMoodSubmit}
      />

    </div>
  );
};

export default App;