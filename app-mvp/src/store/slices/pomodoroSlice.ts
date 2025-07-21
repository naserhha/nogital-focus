import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Timer modes
export type TimerMode = 'work' | 'break';

// Timer state interface
export interface PomodoroState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  totalSessions: number;
  currentSession: number;
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  isCompleted: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: PomodoroState = {
  mode: 'work',
  timeLeft: 25 * 60, // 25 minutes in seconds
  isRunning: false,
  totalSessions: 0,
  currentSession: 0,
  workDuration: 25,
  breakDuration: 5,
  isCompleted: false,
  loading: false,
  error: null,
};

// Async thunk for session completion
export const completeSession = createAsyncThunk(
  'pomodoro/completeSession',
  async (sessionData: { mode: TimerMode; duration: number }) => {
    // Simulate API call to save session data
    await new Promise(resolve => setTimeout(resolve, 100));
    return sessionData;
  }
);

// Pomodoro slice
const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    // Start the timer
    startTimer: (state) => {
      state.isRunning = true;
      state.isCompleted = false;
    },

    // Pause the timer
    pauseTimer: (state) => {
      state.isRunning = false;
    },

    // Reset the timer to initial state
    resetTimer: (state) => {
      state.isRunning = false;
      state.isCompleted = false;
      state.timeLeft = state.workDuration * 60;
      state.mode = 'work';
      state.currentSession = 0;
    },

    // Decrease time by one second
    tick: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },

    // Switch between work and break modes
    switchMode: (state) => {
      if (state.mode === 'work') {
        state.mode = 'break';
        state.timeLeft = state.breakDuration * 60;
        state.currentSession += 1;
      } else {
        state.mode = 'work';
        state.timeLeft = state.workDuration * 60;
      }
      state.isCompleted = false;
    },

    // Set custom durations
    setDurations: (state, action: PayloadAction<{ work: number; break: number }>) => {
      state.workDuration = action.payload.work;
      state.breakDuration = action.payload.break;
      // Reset timer with new durations
      state.timeLeft = action.payload.work * 60;
      state.mode = 'work';
    },

    // Set time left (useful for testing or manual adjustment)
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },

    // Mark session as completed
    markCompleted: (state) => {
      state.isCompleted = true;
      state.totalSessions += 1;
    },

    // Clear any errors
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(completeSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeSession.fulfilled, (state, action) => {
        state.loading = false;
        // Session completed successfully
        state.totalSessions += 1;
      })
      .addCase(completeSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to complete session';
      });
  },
});

// Export actions
export const {
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  switchMode,
  setDurations,
  setTimeLeft,
  markCompleted,
  clearError,
} = pomodoroSlice.actions;

// Export selectors
export const selectPomodoro = (state: { pomodoro: PomodoroState }) => state.pomodoro;
export const selectTimerMode = (state: { pomodoro: PomodoroState }) => state.pomodoro.mode;
export const selectTimeLeft = (state: { pomodoro: PomodoroState }) => state.pomodoro.timeLeft;
export const selectIsRunning = (state: { pomodoro: PomodoroState }) => state.pomodoro.isRunning;
export const selectIsCompleted = (state: { pomodoro: PomodoroState }) => state.pomodoro.isCompleted;
export const selectProgress = (state: { pomodoro: PomodoroState }) => {
  const { timeLeft, workDuration, breakDuration, mode } = state.pomodoro;
  const totalDuration = mode === 'work' ? workDuration * 60 : breakDuration * 60;
  return ((totalDuration - timeLeft) / totalDuration) * 100;
};

// Export reducer
export default pomodoroSlice.reducer; 