import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Analytics data types
export interface FocusSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  mode: 'work' | 'break';
  completed: boolean;
  interruptions: number;
  quality: number; // 1-10 rating
}

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  totalFocusTime: number; // in minutes
  sessions: number;
  averageSessionLength: number;
  longestStreak: number; // consecutive sessions
  interruptions: number;
  quality: number; // average quality rating
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD format
  totalFocusTime: number;
  sessions: number;
  averageDailyFocus: number;
  bestDay: string;
  improvement: number; // percentage change from previous week
}

export interface MonthlyStats {
  month: string; // YYYY-MM format
  totalFocusTime: number;
  sessions: number;
  averageDailyFocus: number;
  totalStreak: number;
  goalAchievement: number; // percentage of monthly goal
}

export interface AnalyticsState {
  // Current data
  todayStats: DailyStats | null;
  weekStats: WeeklyStats | null;
  monthStats: MonthlyStats | null;
  
  // Historical data
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  
  // Focus sessions
  sessions: FocusSession[];
  
  // Goals and targets
  dailyGoal: number; // in minutes
  weeklyGoal: number;
  monthlyGoal: number;
  
  // Streaks
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  
  // Loading states
  loading: {
    today: boolean;
    week: boolean;
    month: boolean;
    sessions: boolean;
  };
  
  error: string | null;
}

// Initial state
const initialState: AnalyticsState = {
  todayStats: null,
  weekStats: null,
  monthStats: null,
  dailyStats: [],
  weeklyStats: [],
  monthlyStats: [],
  sessions: [],
  dailyGoal: 240, // 4 hours
  weeklyGoal: 1200, // 20 hours
  monthlyGoal: 4800, // 80 hours
  currentStreak: 0,
  longestStreak: 0,
  totalSessions: 0,
  loading: {
    today: false,
    week: false,
    month: false,
    sessions: false,
  },
  error: null,
};

// Async thunks for data fetching
export const fetchTodayStats = createAsyncThunk(
  'analytics/fetchTodayStats',
  async (userId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual API call
    const mockTodayStats: DailyStats = {
      date: new Date().toISOString().split('T')[0],
      totalFocusTime: 180, // 3 hours
      sessions: 4,
      averageSessionLength: 45,
      longestStreak: 3,
      interruptions: 2,
      quality: 8.5,
    };
    
    return mockTodayStats;
  }
);

export const fetchWeekStats = createAsyncThunk(
  'analytics/fetchWeekStats',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockWeekStats: WeeklyStats = {
      weekStart: getWeekStart(),
      totalFocusTime: 1200,
      sessions: 28,
      averageDailyFocus: 171,
      bestDay: 'Wednesday',
      improvement: 15,
    };
    
    return mockWeekStats;
  }
);

export const fetchMonthStats = createAsyncThunk(
  'analytics/fetchMonthStats',
  async (userId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockMonthStats: MonthlyStats = {
      month: new Date().toISOString().slice(0, 7),
      totalFocusTime: 4800,
      sessions: 120,
      averageDailyFocus: 160,
      totalStreak: 15,
      goalAchievement: 85,
    };
    
    return mockMonthStats;
  }
);

export const fetchSessions = createAsyncThunk(
  'analytics/fetchSessions',
  async ({ userId, limit = 50 }: { userId: string; limit?: number }) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock sessions
    const mockSessions: FocusSession[] = generateMockSessions(limit);
    
    return mockSessions;
  }
);

export const addSession = createAsyncThunk(
  'analytics/addSession',
  async (session: Omit<FocusSession, 'id'>) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newSession: FocusSession = {
      ...session,
      id: Date.now().toString(),
    };
    
    return newSession;
  }
);

// Analytics slice
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    // Update goals
    updateDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = action.payload;
    },
    
    updateWeeklyGoal: (state, action: PayloadAction<number>) => {
      state.weeklyGoal = action.payload;
    },
    
    updateMonthlyGoal: (state, action: PayloadAction<number>) => {
      state.monthlyGoal = action.payload;
    },
    
    // Update streaks
    updateCurrentStreak: (state, action: PayloadAction<number>) => {
      state.currentStreak = action.payload;
      if (action.payload > state.longestStreak) {
        state.longestStreak = action.payload;
      }
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset analytics
    resetAnalytics: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch today stats
      .addCase(fetchTodayStats.pending, (state) => {
        state.loading.today = true;
        state.error = null;
      })
      .addCase(fetchTodayStats.fulfilled, (state, action) => {
        state.loading.today = false;
        state.todayStats = action.payload;
      })
      .addCase(fetchTodayStats.rejected, (state, action) => {
        state.loading.today = false;
        state.error = action.error.message || 'Failed to fetch today stats';
      })
      
      // Fetch week stats
      .addCase(fetchWeekStats.pending, (state) => {
        state.loading.week = true;
        state.error = null;
      })
      .addCase(fetchWeekStats.fulfilled, (state, action) => {
        state.loading.week = false;
        state.weekStats = action.payload;
      })
      .addCase(fetchWeekStats.rejected, (state, action) => {
        state.loading.week = false;
        state.error = action.error.message || 'Failed to fetch week stats';
      })
      
      // Fetch month stats
      .addCase(fetchMonthStats.pending, (state) => {
        state.loading.month = true;
        state.error = null;
      })
      .addCase(fetchMonthStats.fulfilled, (state, action) => {
        state.loading.month = false;
        state.monthStats = action.payload;
      })
      .addCase(fetchMonthStats.rejected, (state, action) => {
        state.loading.month = false;
        state.error = action.error.message || 'Failed to fetch month stats';
      })
      
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading.sessions = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading.sessions = false;
        state.sessions = action.payload;
        state.totalSessions = action.payload.length;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading.sessions = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })
      
      // Add session
      .addCase(addSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.totalSessions += 1;
        
        // Update today stats
        if (state.todayStats) {
          state.todayStats.totalFocusTime += action.payload.duration;
          state.todayStats.sessions += 1;
          state.todayStats.averageSessionLength = 
            state.todayStats.totalFocusTime / state.todayStats.sessions;
        }
      });
  },
});

// Helper functions
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek;
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function generateMockSessions(count: number): FocusSession[] {
  const sessions: FocusSession[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const sessionStart = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // 2 hours apart
    const duration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
    const sessionEnd = new Date(sessionStart.getTime() + (duration * 60 * 1000));
    
    sessions.push({
      id: `session-${i}`,
      startTime: sessionStart,
      endTime: sessionEnd,
      duration,
      mode: Math.random() > 0.3 ? 'work' : 'break',
      completed: Math.random() > 0.1,
      interruptions: Math.floor(Math.random() * 3),
      quality: Math.floor(Math.random() * 5) + 6, // 6-10 rating
    });
  }
  
  return sessions;
}

// Export actions
export const {
  updateDailyGoal,
  updateWeeklyGoal,
  updateMonthlyGoal,
  updateCurrentStreak,
  clearError,
  resetAnalytics,
} = analyticsSlice.actions;

// Export selectors
export const selectAnalytics = (state: { analytics: AnalyticsState }) => state.analytics;
export const selectTodayStats = (state: { analytics: AnalyticsState }) => state.analytics.todayStats;
export const selectWeekStats = (state: { analytics: AnalyticsState }) => state.analytics.weekStats;
export const selectMonthStats = (state: { analytics: AnalyticsState }) => state.analytics.monthStats;
export const selectSessions = (state: { analytics: AnalyticsState }) => state.analytics.sessions;
export const selectGoals = (state: { analytics: AnalyticsState }) => ({
  daily: state.analytics.dailyGoal,
  weekly: state.analytics.weeklyGoal,
  monthly: state.analytics.monthlyGoal,
});
export const selectStreaks = (state: { analytics: AnalyticsState }) => ({
  current: state.analytics.currentStreak,
  longest: state.analytics.longestStreak,
  total: state.analytics.totalSessions,
});
export const selectLoading = (state: { analytics: AnalyticsState }) => state.analytics.loading;
export const selectError = (state: { analytics: AnalyticsState }) => state.analytics.error;

// Export reducer
export default analyticsSlice.reducer; 