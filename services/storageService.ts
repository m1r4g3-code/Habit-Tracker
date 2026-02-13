import { AppState, Habit, UserProfile, StreakData, Completion, Mood } from '../types';
import { STORAGE_KEYS, LEVEL_CURVE_CONSTANT, LEVEL_CURVE_EXPONENT } from '../constants';
import { getLogicDate, getTodayKey } from '../lib/date';
import { loadFromStorage } from '../lib/storage';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Hero',
  currentLevel: 1,
  currentXP: 0,
  totalLifetimeXP: 0,
  lastActiveDate: new Date().toISOString(),
};

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  streakStartDate: null,
};

const DEFAULT_STATE: AppState = {
  profile: DEFAULT_PROFILE,
  habits: [],
  completions: {},
  moods: {},
  streak: DEFAULT_STREAK,
  isLoading: true,
};

// Re-export date utils
export { getLogicDate, getTodayKey };

export const calculateXPForNextLevel = (level: number): number => {
  return Math.floor(LEVEL_CURVE_CONSTANT * Math.pow(level, LEVEL_CURVE_EXPONENT));
};

export const checkDailyReset = (currentState: AppState): AppState => {
  const now = new Date();
  const todayLogicDate = getLogicDate(now);
  const lastActiveLogicDate = getLogicDate(new Date(currentState.profile.lastActiveDate));

  if (todayLogicDate === lastActiveLogicDate) {
    return currentState;
  }

  const newState = { ...currentState };
  
  // Calculate if streak is broken
  if (currentState.streak.lastCompletionDate) {
      const lastCompDate = new Date(currentState.streak.lastCompletionDate);
      const lastCompLogicDate = getLogicDate(lastCompDate);
      
      const diffTime = Math.abs(new Date(todayLogicDate).getTime() - new Date(lastCompLogicDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      // If gap is more than 1 day (e.g. completed on Day 1, today is Day 3), reset.
      // Day 1 -> Day 2 is OK.
      if (diffDays > 1) {
          newState.streak.currentStreak = 0;
      }
  } else if (newState.streak.currentStreak > 0) {
      // Should not happen if data is consistent, but safety fallback
      newState.streak.currentStreak = 0;
  }

  newState.profile.lastActiveDate = now.toISOString();
  return newState;
};

export const loadAllState = (): AppState => {
  // Load individual slices
  const habits = loadFromStorage<Habit[]>(STORAGE_KEYS.HABITS, []);
  
  const stats = loadFromStorage(STORAGE_KEYS.STATS, {
    profile: DEFAULT_PROFILE,
    completions: {} as Record<string, Completion[]>,
    moods: {} as Record<string, Mood>,
    streak: DEFAULT_STREAK
  });

  // Reconstruct AppState
  return {
    habits,
    profile: stats.profile,
    completions: stats.completions,
    moods: stats.moods,
    streak: stats.streak,
    isLoading: false,
  };
};