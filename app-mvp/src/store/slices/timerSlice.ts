import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  type: 'work' | 'break';
  completed: boolean;
  points: number;
}

export interface TimerState {
  currentSession: FocusSession | null;
  isRunning: boolean;
  timeLeft: number; // seconds
  sessions: FocusSession[];
  loading: boolean;
  error: string | null;
}

const initialState: TimerState = {
  currentSession: null,
  isRunning: false,
  timeLeft: 25 * 60, // 25 minutes default
  sessions: [],
  loading: false,
  error: null,
};

// Async thunks
export const startSession = createAsyncThunk(
  'timer/startSession',
  async ({ type, duration }: { type: 'work' | 'break'; duration: number }) => {
    // This would call the timer service
    return { type, duration, startTime: new Date() };
  }
);

export const completeSession = createAsyncThunk(
  'timer/completeSession',
  async ({ sessionId, completed }: { sessionId: string; completed: boolean }) => {
    // This would call the timer service
    return { sessionId, completed, endTime: new Date() };
  }
);

const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    resetTimer: (state) => {
      state.timeLeft = 25 * 60;
      state.isRunning = false;
      state.currentSession = null;
    },
    addSession: (state, action: PayloadAction<FocusSession>) => {
      state.sessions.push(action.payload);
    },
    updateSession: (state, action: PayloadAction<Partial<FocusSession> & { id: string }>) => {
      const index = state.sessions.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        state.sessions[index] = { ...state.sessions[index], ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = {
          id: Date.now().toString(),
          userId: 'temp', // Will be set by service
          ...action.payload,
          completed: false,
          points: action.payload.type === 'work' ? action.payload.duration : Math.floor(action.payload.duration / 2),
        };
      })
      .addCase(startSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start session';
      })
      .addCase(completeSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeSession.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentSession) {
          state.currentSession.completed = action.payload.completed;
          state.currentSession.endTime = action.payload.endTime;
        }
      })
      .addCase(completeSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to complete session';
      });
  },
});

export const {
  setTimeLeft,
  setIsRunning,
  resetTimer,
  addSession,
  updateSession,
  clearError,
} = timerSlice.actions;

export default timerSlice.reducer; 