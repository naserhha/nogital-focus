# NoGital Focus - MVP Mobile App

A comprehensive productivity app that helps users reclaim their focus through Pomodoro timers, website/app blocking, gamification, and focus analytics.

## 🎯 MVP Features

### Core Features
- ⏱️ **Pomodoro Timer** - 25/5 minute work/break cycles
- 🚫 **Website & App Blocker** - Block distracting sites/apps during focus sessions
- 🏆 **Gamification System** - Points, achievements, streaks
- 📊 **Focus Analytics Dashboard** - Track productivity patterns
- 👤 **User Authentication** - Sign up/login with data persistence
- 💾 **Cloud Sync** - Firebase Firestore for data storage

### MVP Scope
- **Platform**: React Native (iOS + Android)
- **Backend**: Firebase (Auth, Firestore, Functions)
- **Development Time**: 8-12 weeks
- **Team Size**: 2-3 developers

## 🏗️ Project Structure

```
nogital-focus-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Timer/
│   │   ├── Blocker/
│   │   ├── Analytics/
│   │   └── Common/
│   ├── screens/             # App screens
│   │   ├── Auth/
│   │   ├── Timer/
│   │   ├── Blocker/
│   │   ├── Analytics/
│   │   └── Profile/
│   ├── services/            # API and business logic
│   │   ├── auth.js
│   │   ├── timer.js
│   │   ├── blocker.js
│   │   ├── analytics.js
│   │   └── firebase.js
│   ├── store/              # State management
│   │   ├── slices/
│   │   └── index.js
│   ├── utils/              # Helper functions
│   ├── constants/          # App constants
│   └── navigation/         # Navigation setup
├── assets/                 # Images, fonts, etc.
├── android/               # Android specific files
├── ios/                   # iOS specific files
├── firebase/              # Firebase configuration
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

### Frontend
- **React Native** (0.72+) - Cross-platform mobile development
- **Expo** - Development tools and services
- **Redux Toolkit** - State management
- **React Navigation** - Navigation between screens
- **React Native Elements** - UI component library

### Backend & Services
- **Firebase Authentication** - User sign up/login
- **Firebase Firestore** - Real-time database
- **Firebase Functions** - Serverless backend logic
- **Firebase Analytics** - User behavior tracking

### Development Tools
- **TypeScript** - Type safety
- **ESLint + Prettier** - Code quality
- **Jest** - Unit testing
- **Detox** - E2E testing

## 📱 App Architecture

### Screen Flow
```
Splash → Auth → Main Tab Navigator
                    ├── Timer (Home)
                    ├── Blocker
                    ├── Analytics
                    └── Profile
```

### Data Models

```typescript
// User Profile
interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  totalFocusTime: number;
  totalSessions: number;
  currentStreak: number;
  points: number;
  level: number;
}

// Focus Session
interface FocusSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  type: 'work' | 'break';
  completed: boolean;
  points: number;
}

// Blocked Site/App
interface BlockedItem {
  id: string;
  userId: string;
  name: string;
  url?: string;
  packageName?: string; // for Android apps
  type: 'website' | 'app';
  isActive: boolean;
  createdAt: Date;
}

// Achievement
interface Achievement {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  points: number;
  unlockedAt: Date;
}
```

## 🚀 Development Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and configuration
- [ ] Firebase project setup
- [ ] Authentication screens (Login/Signup)
- [ ] Basic navigation structure
- [ ] User profile management

### Phase 2: Core Timer (Weeks 3-4)
- [ ] Pomodoro timer implementation
- [ ] Timer UI and controls
- [ ] Session tracking
- [ ] Background timer functionality
- [ ] Notification system

### Phase 3: Blocker System (Weeks 5-6)
- [ ] Website blocker (browser extension)
- [ ] App blocker (Android focus mode)
- [ ] Blocked sites/apps management
- [ ] Integration with timer sessions

### Phase 4: Analytics & Gamification (Weeks 7-8)
- [ ] Focus analytics dashboard
- [ ] Points and achievements system
- [ ] Streak tracking
- [ ] Progress visualization

### Phase 5: Polish & Testing (Weeks 9-10)
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing and bug fixes
- [ ] App store preparation

### Phase 6: Launch (Weeks 11-12)
- [ ] Beta testing
- [ ] App store submission
- [ ] Documentation
- [ ] Marketing materials

## 💻 Sample Code

### Pomodoro Timer Component

```typescript
// src/components/Timer/PomodoroTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { startSession, completeSession } from '../../store/slices/timerSlice';

interface PomodoroTimerProps {
  workDuration?: number; // 25 minutes default
  breakDuration?: number; // 5 minutes default
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  workDuration = 25,
  breakDuration = 5
}) => {
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [sessions, setSessions] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleStart = () => {
    setIsRunning(true);
    dispatch(startSession({
      type: isWorkSession ? 'work' : 'break',
      duration: isWorkSession ? workDuration : breakDuration
    }));
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isWorkSession ? workDuration * 60 : breakDuration * 60);
  };

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Show notification
    Alert.alert(
      isWorkSession ? 'Work Session Complete!' : 'Break Complete!',
      isWorkSession 
        ? 'Great job! Take a break.' 
        : 'Ready to focus again?',
      [
        {
          text: 'Continue',
          onPress: () => {
            if (isWorkSession) {
              // Switch to break
              setIsWorkSession(false);
              setTimeLeft(breakDuration * 60);
              setSessions(prev => prev + 1);
            } else {
              // Switch to work
              setIsWorkSession(true);
              setTimeLeft(workDuration * 60);
            }
          }
        }
      ]
    );

    // Save session data
    dispatch(completeSession({
      type: isWorkSession ? 'work' : 'break',
      duration: isWorkSession ? workDuration : breakDuration,
      completed: true
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.sessionType}>
          {isWorkSession ? 'Focus Time' : 'Break Time'}
        </Text>
        <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
        <Text style={styles.sessions}>Sessions: {sessions}</Text>
      </View>

      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pauseButton} onPress={handlePause}>
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  sessionType: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  timer: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#2563eb',
    fontFamily: 'monospace',
  },
  sessions: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PomodoroTimer;
```

### Timer Service

```typescript
// src/services/timer.ts
import { FirebaseFirestore } from '@react-native-firebase/firestore';
import { store } from '../store';
import { addSession, updateSession } from '../store/slices/timerSlice';

export class TimerService {
  private static instance: TimerService;
  private currentSessionId: string | null = null;

  static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  async startSession(type: 'work' | 'break', duration: number): Promise<string> {
    const userId = store.getState().auth.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const sessionData = {
      userId,
      type,
      duration,
      startTime: new Date(),
      completed: false,
      points: type === 'work' ? duration : Math.floor(duration / 2)
    };

    const docRef = await FirebaseFirestore()
      .collection('sessions')
      .add(sessionData);

    this.currentSessionId = docRef.id;
    
    // Update local state
    store.dispatch(addSession({
      id: docRef.id,
      ...sessionData
    }));

    return docRef.id;
  }

  async completeSession(sessionId: string, completed: boolean = true): Promise<void> {
    const userId = store.getState().auth.user?.id;
    if (!userId) throw new Error('User not authenticated');

    const updateData = {
      endTime: new Date(),
      completed,
      points: completed ? store.getState().timer.currentSession?.points || 0 : 0
    };

    await FirebaseFirestore()
      .collection('sessions')
      .doc(sessionId)
      .update(updateData);

    // Update local state
    store.dispatch(updateSession({
      id: sessionId,
      ...updateData
    }));

    // Update user stats
    if (completed) {
      await this.updateUserStats(userId, updateData.points);
    }

    this.currentSessionId = null;
  }

  private async updateUserStats(userId: string, points: number): Promise<void> {
    const userRef = FirebaseFirestore().collection('users').doc(userId);
    
    await userRef.update({
      totalFocusTime: FirebaseFirestore.FieldValue.increment(points),
      totalSessions: FirebaseFirestore.FieldValue.increment(1),
      points: FirebaseFirestore.FieldValue.increment(points)
    });
  }

  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}

export default TimerService.getInstance();
```

## 🔧 Implementation Notes

### Critical Implementation Points

1. **Background Timer**
   - Use `react-native-background-timer` for Android
   - iOS background app refresh limitations
   - Local notifications for session completion

2. **Website Blocker**
   - Browser extension for web blocking
   - Android focus mode for app blocking
   - iOS Screen Time API limitations

3. **Data Synchronization**
   - Real-time Firestore listeners
   - Offline support with local storage
   - Conflict resolution for concurrent edits

4. **Performance**
   - Lazy loading for analytics data
   - Image optimization
   - Memory management for long-running timers

### Security Considerations

- Firebase Security Rules for data access
- Input validation and sanitization
- Secure storage for sensitive data
- API rate limiting

### Testing Strategy

- Unit tests for business logic
- Integration tests for Firebase
- E2E tests with Detox
- Manual testing on real devices

## 📊 Success Metrics

### Technical Metrics
- App crash rate < 1%
- Timer accuracy within 1 second
- Data sync latency < 2 seconds
- App launch time < 3 seconds

### User Metrics
- Daily active users
- Average session duration
- Focus session completion rate
- User retention rate

## 🚀 Next Steps

1. **Set up development environment**
2. **Create Firebase project**
3. **Initialize React Native project**
4. **Implement authentication flow**
5. **Build timer component**
6. **Add analytics dashboard**
7. **Integrate blocker system**
8. **Polish UI/UX**
9. **Test and deploy**

This MVP provides a solid foundation for the NoGital Focus app with all core features while maintaining scalability for future enhancements. 