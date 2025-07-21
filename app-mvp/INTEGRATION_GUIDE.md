# Pomodoro Timer Integration Guide

This guide explains how to integrate the Pomodoro Timer component into your React Native app with Redux Toolkit.

## 📋 Prerequisites

Make sure you have the following dependencies installed:

```bash
npm install @reduxjs/toolkit react-redux
npm install react-native
```

## 🏗️ Project Structure

```
src/
├── store/
│   ├── index.ts                 # Store configuration
│   └── slices/
│       └── pomodoroSlice.ts     # Pomodoro timer state management
├── components/
│   └── Timer/
│       └── PomodoroTimer.tsx    # Main timer component
└── screens/
    └── TimerScreen.tsx          # Screen using the timer
```

## 🔧 Step-by-Step Integration

### Step 1: Set up Redux Store

1. **Create the store configuration** (`src/store/index.ts`):

```typescript
import { configureStore } from '@reduxjs/toolkit';
import pomodoroReducer from './slices/pomodoroSlice';

export const store = configureStore({
  reducer: {
    pomodoro: pomodoroReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

2. **Wrap your app with Provider** (`App.tsx`):

```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import TimerScreen from './src/screens/TimerScreen';

const App = () => {
  return (
    <Provider store={store}>
      <TimerScreen />
    </Provider>
  );
};

export default App;
```

### Step 2: Create a Timer Screen

Create `src/screens/TimerScreen.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import PomodoroTimer from '../components/Timer/PomodoroTimer';

const TimerScreen: React.FC = () => {
  const handleSessionComplete = (mode: 'work' | 'break') => {
    console.log(`${mode} session completed!`);
    // Add your custom logic here
    // e.g., save to database, show notification, etc.
  };

  return (
    <SafeAreaView style={styles.container}>
      <PomodoroTimer
        workDuration={25}
        breakDuration={5}
        onSessionComplete={handleSessionComplete}
        showProgressBar={true}
        showSessionCount={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default TimerScreen;
```

### Step 3: Customize the Timer

You can customize the timer by passing different props:

```typescript
// Custom durations
<PomodoroTimer
  workDuration={30}    // 30 minutes work
  breakDuration={10}   // 10 minutes break
/>

// Hide progress bar
<PomodoroTimer
  showProgressBar={false}
/>

// Hide session counter
<PomodoroTimer
  showSessionCount={false}
/>

// Custom session completion handler
<PomodoroTimer
  onSessionComplete={(mode) => {
    if (mode === 'work') {
      // Handle work session completion
      saveWorkSession();
    } else {
      // Handle break session completion
      saveBreakSession();
    }
  }}
/>
```

## 🎨 Customization Options

### Props Interface

```typescript
interface PomodoroTimerProps {
  workDuration?: number;           // Work session duration in minutes (default: 25)
  breakDuration?: number;          // Break session duration in minutes (default: 5)
  onSessionComplete?: (mode: 'work' | 'break') => void;  // Callback when session completes
  showProgressBar?: boolean;       // Show/hide progress bar (default: true)
  showSessionCount?: boolean;      // Show/hide session counter (default: true)
}
```

### Styling Customization

The component uses a clean, modern design with:

- **Work Mode**: Red color scheme (`#ef4444`)
- **Break Mode**: Green color scheme (`#10b981`)
- **Responsive Design**: Adapts to different screen sizes
- **Smooth Animations**: Progress bar animates smoothly

### Redux State Structure

```typescript
interface PomodoroState {
  mode: 'work' | 'break';         // Current timer mode
  timeLeft: number;               // Time remaining in seconds
  isRunning: boolean;             // Timer running state
  totalSessions: number;          // Total completed sessions
  currentSession: number;         // Current session number
  workDuration: number;           // Work session duration in minutes
  breakDuration: number;          // Break session duration in minutes
  isCompleted: boolean;           // Session completion state
  loading: boolean;               // Loading state for async operations
  error: string | null;           // Error state
}
```

## 🔄 Redux Actions

### Available Actions

```typescript
// Timer control
dispatch(startTimer());           // Start the timer
dispatch(pauseTimer());           // Pause the timer
dispatch(resetTimer());           // Reset timer to initial state

// Timer progression
dispatch(tick());                 // Decrease time by 1 second
dispatch(switchMode());           // Switch between work/break modes

// Session management
dispatch(markCompleted());        // Mark current session as completed
dispatch(completeSession({ mode, duration })); // Save session data

// Configuration
dispatch(setDurations({ work: 30, break: 10 })); // Set custom durations
dispatch(setTimeLeft(1500));      // Set time left manually (for testing)
dispatch(clearError());           // Clear error state
```

### Selectors

```typescript
// Get entire pomodoro state
const pomodoro = useSelector(selectPomodoro);

// Get specific values
const mode = useSelector(selectTimerMode);
const timeLeft = useSelector(selectTimeLeft);
const isRunning = useSelector(selectIsRunning);
const isCompleted = useSelector(selectIsCompleted);
const progress = useSelector(selectProgress); // Progress percentage
```

## 🧪 Testing

### Unit Tests

Create `src/components/Timer/__tests__/PomodoroTimer.test.tsx`:

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import pomodoroReducer from '../../../store/slices/pomodoroSlice';
import PomodoroTimer from '../PomodoroTimer';

const createTestStore = () => {
  return configureStore({
    reducer: {
      pomodoro: pomodoroReducer,
    },
  });
};

describe('PomodoroTimer', () => {
  it('renders timer display', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PomodoroTimer />
      </Provider>
    );
    
    expect(getByText('25:00')).toBeTruthy();
  });

  it('starts timer when start button is pressed', () => {
    const store = createTestStore();
    const { getByText } = render(
      <Provider store={store}>
        <PomodoroTimer />
      </Provider>
    );
    
    fireEvent.press(getByText('Start'));
    expect(store.getState().pomodoro.isRunning).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Test timer completion flow
it('switches to break mode after work session', async () => {
  const store = createTestStore();
  const { getByText } = render(
    <Provider store={store}>
      <PomodoroTimer workDuration={1} breakDuration={1} />
    </Provider>
  );
  
  fireEvent.press(getByText('Start'));
  
  // Wait for timer to complete (1 minute)
  await new Promise(resolve => setTimeout(resolve, 61000));
  
  expect(store.getState().pomodoro.mode).toBe('break');
});
```

## 🚀 Advanced Usage

### Background Timer Support

For background timer functionality, install and configure:

```bash
npm install react-native-background-timer
```

Then update the timer component to use background timer:

```typescript
import BackgroundTimer from 'react-native-background-timer';

// In useEffect for timer
useEffect(() => {
  if (pomodoro.isRunning && pomodoro.timeLeft > 0) {
    const intervalId = BackgroundTimer.setInterval(() => {
      dispatch(tick());
    }, 1000);
    
    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }
}, [pomodoro.isRunning, pomodoro.timeLeft]);
```

### Notifications

Add push notifications for timer completion:

```typescript
import PushNotification from 'react-native-push-notification';

const handleTimerComplete = () => {
  PushNotification.localNotification({
    title: 'Session Complete!',
    message: 'Time to take a break or start a new session.',
    playSound: true,
    soundName: 'default',
  });
};
```

### Data Persistence

Save timer data to AsyncStorage:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save timer state
const saveTimerState = async (state) => {
  try {
    await AsyncStorage.setItem('pomodoroState', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
};

// Load timer state
const loadTimerState = async () => {
  try {
    const savedState = await AsyncStorage.getItem('pomodoroState');
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Error loading timer state:', error);
    return null;
  }
};
```

## 🔧 Troubleshooting

### Common Issues

1. **Timer not updating**: Check if Redux store is properly connected
2. **Progress bar not animating**: Ensure `useNativeDriver: false` for width animations
3. **Timer continues in background**: Implement proper cleanup in useEffect
4. **State not persisting**: Add AsyncStorage integration for data persistence

### Performance Tips

1. **Use React.memo** for the component if it's re-rendering frequently
2. **Optimize selectors** with `reselect` for complex state calculations
3. **Debounce rapid state updates** if needed
4. **Use `useCallback`** for event handlers to prevent unnecessary re-renders

## 📱 Platform Considerations

### iOS
- Background app refresh limitations
- Use `react-native-background-timer` for background functionality
- Configure background modes in Info.plist

### Android
- Foreground service for reliable background timer
- Wake lock permissions for keeping timer active
- Battery optimization considerations

## 🎯 Best Practices

1. **State Management**: Use Redux Toolkit for predictable state updates
2. **TypeScript**: Leverage TypeScript for type safety
3. **Testing**: Write comprehensive tests for timer logic
4. **Accessibility**: Add accessibility labels for screen readers
5. **Performance**: Optimize re-renders and animations
6. **Error Handling**: Implement proper error boundaries
7. **Documentation**: Keep code well-documented with comments

This integration guide provides everything you need to successfully implement the Pomodoro Timer component in your React Native app with Redux Toolkit. 