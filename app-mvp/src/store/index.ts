import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import timerReducer from './slices/timerSlice';
import blockerReducer from './slices/blockerSlice';
import analyticsReducer from './slices/analyticsSlice';
import pomodoroReducer from './slices/pomodoroSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timer: timerReducer,
    blocker: blockerReducer,
    analytics: analyticsReducer,
    pomodoro: pomodoroReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 