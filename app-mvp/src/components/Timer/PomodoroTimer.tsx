import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  switchMode,
  markCompleted,
  completeSession,
  selectPomodoro,
  selectProgress,
} from '../../store/slices/pomodoroSlice';
import { RootState } from '../../store';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

interface PomodoroTimerProps {
  workDuration?: number; // in minutes
  breakDuration?: number; // in minutes
  onSessionComplete?: (mode: 'work' | 'break') => void;
  showProgressBar?: boolean;
  showSessionCount?: boolean;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  workDuration = 25,
  breakDuration = 5,
  onSessionComplete,
  showProgressBar = true,
  showSessionCount = true,
}) => {
  const dispatch = useDispatch();
  const pomodoro = useSelector(selectPomodoro);
  const progress = useSelector(selectProgress);
  
  // Animation value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Timer interval reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get mode-specific colors
  const getModeColors = () => {
    return pomodoro.mode === 'work' 
      ? { primary: '#ef4444', secondary: '#fef2f2', text: '#991b1b' }
      : { primary: '#10b981', secondary: '#f0fdf4', text: '#065f46' };
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    dispatch(markCompleted());
    
    // Show completion alert
    Alert.alert(
      `${pomodoro.mode === 'work' ? 'Work' : 'Break'} Session Complete!`,
      pomodoro.mode === 'work' 
        ? 'Great job! Time for a break.' 
        : 'Break is over. Ready to focus again?',
      [
        {
          text: 'Continue',
          onPress: () => {
            // Switch to next mode
            dispatch(switchMode());
            
            // Call completion callback if provided
            if (onSessionComplete) {
              onSessionComplete(pomodoro.mode);
            }
            
            // Save session data
            dispatch(completeSession({
              mode: pomodoro.mode,
              duration: pomodoro.mode === 'work' ? workDuration : breakDuration,
            }));
          },
        },
      ]
    );
  };

  // Handle start/pause button press
  const handleStartPause = () => {
    if (pomodoro.isRunning) {
      dispatch(pauseTimer());
    } else {
      dispatch(startTimer());
    }
  };

  // Handle reset button press
  const handleReset = () => {
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => dispatch(resetTimer()),
        },
      ]
    );
  };

  // Timer effect - runs every second when timer is active
  useEffect(() => {
    if (pomodoro.isRunning && pomodoro.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        dispatch(tick());
      }, 1000);
    } else if (pomodoro.timeLeft === 0 && pomodoro.isRunning) {
      // Timer completed
      dispatch(pauseTimer());
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pomodoro.isRunning, pomodoro.timeLeft]);

  // Progress bar animation effect
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Set custom durations on mount
  useEffect(() => {
    if (workDuration !== 25 || breakDuration !== 5) {
      // This would be handled by a separate action to set durations
      // For now, we'll use the default values from the slice
    }
  }, [workDuration, breakDuration]);

  const colors = getModeColors();

  return (
    <View style={styles.container}>
      {/* Mode indicator */}
      <View style={[styles.modeContainer, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.modeText, { color: colors.text }]}>
          {pomodoro.mode === 'work' ? 'Focus Time' : 'Break Time'}
        </Text>
      </View>

      {/* Timer display */}
      <View style={styles.timerContainer}>
        <Text style={[styles.timerText, { color: colors.primary }]}>
          {formatTime(pomodoro.timeLeft)}
        </Text>
        
        {/* Session counter */}
        {showSessionCount && (
          <Text style={styles.sessionText}>
            Session {pomodoro.currentSession + 1}
          </Text>
        )}
      </View>

      {/* Progress bar */}
      {showProgressBar && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBackground, { backgroundColor: colors.secondary }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        {/* Start/Pause button */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {pomodoro.isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        {/* Reset button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.secondaryButton]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: '#6b7280' }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Session stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Total Sessions: {pomodoro.totalSessions}
        </Text>
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
    backgroundColor: '#ffffff',
  },
  modeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  sessionText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 10,
    fontWeight: '500',
  },
  progressContainer: {
    width: width - 80,
    marginBottom: 40,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 30,
  },
  controlButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default PomodoroTimer; 