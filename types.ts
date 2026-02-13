export type XPValue = 20 | 30 | 50 | 70 | 100;

export type Mood = 'focused' | 'good' | 'neutral' | 'frustrated' | 'low_energy';

export interface Habit {
  id: string;
  name: string;
  xpValue: XPValue;
  createdAt: string; // ISO String
  isArchived: boolean;
}

export interface Completion {
  habitId: string;
  completedAt: string; // ISO String
  xpGained: number;
}

export interface UserProfile {
  name: string;
  currentLevel: number;
  currentXP: number;
  totalLifetimeXP: number;
  lastActiveDate: string; // ISO String
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // ISO String
  streakStartDate: string | null; // ISO String
}

export interface AppState {
  profile: UserProfile;
  habits: Habit[];
  completions: Record<string, Completion[]>; // Key: YYYY-MM-DD
  moods: Record<string, Mood>; // Key: YYYY-MM-DD
  streak: StreakData;
  isLoading: boolean;
}