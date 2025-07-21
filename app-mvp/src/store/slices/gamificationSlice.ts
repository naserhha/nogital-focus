import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Gamification data types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'focus' | 'streak' | 'time' | 'quality' | 'special';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  required: number; // Required value to unlock
  current: number; // Current progress value
}

export interface Level {
  level: number;
  name: string;
  pointsRequired: number;
  rewards: string[];
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'theme' | 'feature' | 'badge' | 'custom';
  pointsCost: number;
  unlocked: boolean;
  unlockedAt?: Date;
  available: boolean;
}

export interface GamificationState {
  // User progress
  points: number;
  level: number;
  experience: number;
  experienceToNext: number;
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  
  // Levels
  levels: Level[];
  currentLevel: Level | null;
  
  // Rewards
  rewards: Reward[];
  unlockedRewards: Reward[];
  
  // Streaks and milestones
  currentStreak: number;
  longestStreak: number;
  totalFocusTime: number;
  totalSessions: number;
  
  // Daily challenges
  dailyChallenges: {
    id: string;
    title: string;
    description: string;
    target: number;
    current: number;
    completed: boolean;
    reward: number;
  }[];
  
  // Loading states
  loading: {
    achievements: boolean;
    rewards: boolean;
    challenges: boolean;
  };
  
  error: string | null;
}

// Initial achievements
const initialAchievements: Achievement[] = [
  {
    id: 'first-session',
    name: 'First Steps',
    description: 'Complete your first focus session',
    icon: '🎯',
    category: 'focus',
    points: 10,
    unlocked: false,
    progress: 0,
    required: 1,
    current: 0,
  },
  {
    id: 'streak-3',
    name: 'Getting Started',
    description: 'Maintain a 3-day focus streak',
    icon: '🔥',
    category: 'streak',
    points: 25,
    unlocked: false,
    progress: 0,
    required: 3,
    current: 0,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day focus streak',
    icon: '⚡',
    category: 'streak',
    points: 50,
    unlocked: false,
    progress: 0,
    required: 7,
    current: 0,
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day focus streak',
    icon: '👑',
    category: 'streak',
    points: 200,
    unlocked: false,
    progress: 0,
    required: 30,
    current: 0,
  },
  {
    id: 'focus-1-hour',
    name: 'Hour Hero',
    description: 'Complete a 1-hour focus session',
    icon: '⏰',
    category: 'time',
    points: 15,
    unlocked: false,
    progress: 0,
    required: 60,
    current: 0,
  },
  {
    id: 'focus-4-hours',
    name: 'Half-Day Hero',
    description: 'Focus for 4 hours in a day',
    icon: '🌅',
    category: 'time',
    points: 40,
    unlocked: false,
    progress: 0,
    required: 240,
    current: 0,
  },
  {
    id: 'quality-9',
    name: 'Perfectionist',
    description: 'Rate a session quality 9 or higher',
    icon: '⭐',
    category: 'quality',
    points: 20,
    unlocked: false,
    progress: 0,
    required: 9,
    current: 0,
  },
  {
    id: 'sessions-100',
    name: 'Century Club',
    description: 'Complete 100 focus sessions',
    icon: '💯',
    category: 'focus',
    points: 100,
    unlocked: false,
    progress: 0,
    required: 100,
    current: 0,
  },
  {
    id: 'focus-100-hours',
    name: 'Century Hours',
    description: 'Accumulate 100 hours of focus time',
    icon: '🏆',
    category: 'time',
    points: 150,
    unlocked: false,
    progress: 0,
    required: 6000,
    current: 0,
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all daily goals for a week',
    icon: '🌟',
    category: 'special',
    points: 75,
    unlocked: false,
    progress: 0,
    required: 7,
    current: 0,
  },
];

// Initial levels
const initialLevels: Level[] = [
  { level: 1, name: 'Novice', pointsRequired: 0, rewards: ['Basic Theme'], unlocked: true },
  { level: 2, name: 'Apprentice', pointsRequired: 50, rewards: ['Advanced Stats'], unlocked: false },
  { level: 3, name: 'Practitioner', pointsRequired: 150, rewards: ['Custom Themes'], unlocked: false },
  { level: 4, name: 'Expert', pointsRequired: 300, rewards: ['Premium Features'], unlocked: false },
  { level: 5, name: 'Master', pointsRequired: 500, rewards: ['Exclusive Badges'], unlocked: false },
  { level: 6, name: 'Grandmaster', pointsRequired: 800, rewards: ['All Features'], unlocked: false },
  { level: 7, name: 'Legend', pointsRequired: 1200, rewards: ['Legendary Status'], unlocked: false },
];

// Initial rewards
const initialRewards: Reward[] = [
  {
    id: 'dark-theme',
    name: 'Dark Theme',
    description: 'Unlock dark mode for the app',
    icon: '🌙',
    category: 'theme',
    pointsCost: 25,
    unlocked: false,
    available: true,
  },
  {
    id: 'custom-timer',
    name: 'Custom Timer',
    description: 'Set custom focus session durations',
    icon: '⚙️',
    category: 'feature',
    pointsCost: 50,
    unlocked: false,
    available: true,
  },
  {
    id: 'advanced-analytics',
    name: 'Advanced Analytics',
    description: 'Detailed focus time analytics',
    icon: '📊',
    category: 'feature',
    pointsCost: 75,
    unlocked: false,
    available: true,
  },
  {
    id: 'focus-badge',
    name: 'Focus Badge',
    description: 'Display your focus achievements',
    icon: '🏅',
    category: 'badge',
    pointsCost: 100,
    unlocked: false,
    available: true,
  },
  {
    id: 'premium-sounds',
    name: 'Premium Sounds',
    description: 'High-quality focus sounds',
    icon: '🎵',
    category: 'feature',
    pointsCost: 150,
    unlocked: false,
    available: true,
  },
];

// Initial state
const initialState: GamificationState = {
  points: 0,
  level: 1,
  experience: 0,
  experienceToNext: 50,
  achievements: initialAchievements,
  unlockedAchievements: [],
  levels: initialLevels,
  currentLevel: initialLevels[0],
  rewards: initialRewards,
  unlockedRewards: [],
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  totalSessions: 0,
  dailyChallenges: [
    {
      id: 'daily-focus-2',
      title: 'Focus for 2 Hours',
      description: 'Complete 2 hours of focused work today',
      target: 120,
      current: 0,
      completed: false,
      reward: 15,
    },
    {
      id: 'daily-sessions-3',
      title: '3 Sessions Today',
      description: 'Complete 3 focus sessions today',
      target: 3,
      current: 0,
      completed: false,
      reward: 10,
    },
    {
      id: 'daily-quality-8',
      title: 'High Quality',
      description: 'Rate a session 8 or higher',
      target: 8,
      current: 0,
      completed: false,
      reward: 20,
    },
  ],
  loading: {
    achievements: false,
    rewards: false,
    challenges: false,
  },
  error: null,
};

// Async thunks
export const fetchGamificationData = createAsyncThunk(
  'gamification/fetchData',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual API call
    return {
      points: 125,
      level: 3,
      experience: 75,
      experienceToNext: 75,
      currentStreak: 5,
      longestStreak: 12,
      totalFocusTime: 3600,
      totalSessions: 45,
    };
  }
);

export const unlockAchievement = createAsyncThunk(
  'gamification/unlockAchievement',
  async ({ achievementId, userId }: { achievementId: string; userId: string }) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { achievementId, unlockedAt: new Date() };
  }
);

export const purchaseReward = createAsyncThunk(
  'gamification/purchaseReward',
  async ({ rewardId, userId }: { rewardId: string; userId: string }) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return { rewardId, purchasedAt: new Date() };
  }
);

// Gamification slice
const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    // Add points
    addPoints: (state, action: PayloadAction<number>) => {
      state.points += action.payload;
      state.experience += action.payload;
      
      // Check for level up
      const currentLevelData = state.levels.find(l => l.level === state.level);
      if (currentLevelData && state.experience >= currentLevelData.pointsRequired) {
        state.level += 1;
        state.experienceToNext = getNextLevelRequirement(state.level);
        
        // Unlock new level
        const newLevel = state.levels.find(l => l.level === state.level);
        if (newLevel) {
          newLevel.unlocked = true;
          newLevel.unlockedAt = new Date();
          state.currentLevel = newLevel;
        }
      }
    },
    
    // Update streak
    updateStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload;
      if (action.payload > state.longestStreak) {
        state.longestStreak = action.payload;
      }
    },
    
    // Update focus time
    updateFocusTime: (state, action: PayloadAction<number>) => {
      state.totalFocusTime += action.payload;
    },
    
    // Update sessions count
    updateSessionsCount: (state, action: PayloadAction<number>) => {
      state.totalSessions += action.payload;
    },
    
    // Update achievement progress
    updateAchievementProgress: (state, action: PayloadAction<{
      achievementId: string;
      current: number;
    }>) => {
      const achievement = state.achievements.find(a => a.id === action.payload.achievementId);
      if (achievement) {
        achievement.current = action.payload.current;
        achievement.progress = Math.min((achievement.current / achievement.required) * 100, 100);
        
        // Check if achievement is unlocked
        if (achievement.current >= achievement.required && !achievement.unlocked) {
          achievement.unlocked = true;
          achievement.unlockedAt = new Date();
          state.unlockedAchievements.push(achievement);
          state.points += achievement.points;
        }
      }
    },
    
    // Complete daily challenge
    completeDailyChallenge: (state, action: PayloadAction<string>) => {
      const challenge = state.dailyChallenges.find(c => c.id === action.payload);
      if (challenge && !challenge.completed) {
        challenge.completed = true;
        state.points += challenge.reward;
      }
    },
    
    // Update daily challenge progress
    updateDailyChallengeProgress: (state, action: PayloadAction<{
      challengeId: string;
      current: number;
    }>) => {
      const challenge = state.dailyChallenges.find(c => c.id === action.payload.challengeId);
      if (challenge) {
        challenge.current = action.payload.current;
        challenge.completed = challenge.current >= challenge.target;
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset gamification
    resetGamification: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch gamification data
      .addCase(fetchGamificationData.pending, (state) => {
        state.loading.achievements = true;
        state.error = null;
      })
      .addCase(fetchGamificationData.fulfilled, (state, action) => {
        state.loading.achievements = false;
        state.points = action.payload.points;
        state.level = action.payload.level;
        state.experience = action.payload.experience;
        state.experienceToNext = action.payload.experienceToNext;
        state.currentStreak = action.payload.currentStreak;
        state.longestStreak = action.payload.longestStreak;
        state.totalFocusTime = action.payload.totalFocusTime;
        state.totalSessions = action.payload.totalSessions;
      })
      .addCase(fetchGamificationData.rejected, (state, action) => {
        state.loading.achievements = false;
        state.error = action.error.message || 'Failed to fetch gamification data';
      })
      
      // Unlock achievement
      .addCase(unlockAchievement.fulfilled, (state, action) => {
        const achievement = state.achievements.find(a => a.id === action.payload.achievementId);
        if (achievement) {
          achievement.unlocked = true;
          achievement.unlockedAt = action.payload.unlockedAt;
          state.unlockedAchievements.push(achievement);
          state.points += achievement.points;
        }
      })
      
      // Purchase reward
      .addCase(purchaseReward.fulfilled, (state, action) => {
        const reward = state.rewards.find(r => r.id === action.payload.rewardId);
        if (reward && state.points >= reward.pointsCost) {
          reward.unlocked = true;
          reward.unlockedAt = action.payload.purchasedAt;
          state.points -= reward.pointsCost;
          state.unlockedRewards.push(reward);
        }
      });
  },
});

// Helper functions
function getNextLevelRequirement(level: number): number {
  const levelRequirements = [0, 50, 150, 300, 500, 800, 1200];
  return levelRequirements[level] || 1200;
}

// Export actions
export const {
  addPoints,
  updateStreak,
  updateFocusTime,
  updateSessionsCount,
  updateAchievementProgress,
  completeDailyChallenge,
  updateDailyChallengeProgress,
  clearError,
  resetGamification,
} = gamificationSlice.actions;

// Export selectors
export const selectGamification = (state: { gamification: GamificationState }) => state.gamification;
export const selectPoints = (state: { gamification: GamificationState }) => state.gamification.points;
export const selectLevel = (state: { gamification: GamificationState }) => state.gamification.level;
export const selectExperience = (state: { gamification: GamificationState }) => ({
  current: state.gamification.experience,
  toNext: state.gamification.experienceToNext,
  progress: (state.gamification.experience / state.gamification.experienceToNext) * 100,
});
export const selectAchievements = (state: { gamification: GamificationState }) => ({
  all: state.gamification.achievements,
  unlocked: state.gamification.unlockedAchievements,
  locked: state.gamification.achievements.filter(a => !a.unlocked),
});
export const selectRewards = (state: { gamification: GamificationState }) => ({
  all: state.gamification.rewards,
  unlocked: state.gamification.unlockedRewards,
  available: state.gamification.rewards.filter(r => r.available && !r.unlocked),
});
export const selectStreaks = (state: { gamification: GamificationState }) => ({
  current: state.gamification.currentStreak,
  longest: state.gamification.longestStreak,
});
export const selectDailyChallenges = (state: { gamification: GamificationState }) => state.gamification.dailyChallenges;
export const selectLoading = (state: { gamification: GamificationState }) => state.gamification.loading;
export const selectError = (state: { gamification: GamificationState }) => state.gamification.error;

// Export reducer
export default gamificationSlice.reducer; 