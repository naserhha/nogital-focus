import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MotivationalMessageProps {
  currentStreak: number;
  totalFocusTime: number;
  dailyGoal: number;
}

const MotivationalMessage: React.FC<MotivationalMessageProps> = ({
  currentStreak,
  totalFocusTime,
  dailyGoal,
}) => {
  const getMessage = () => {
    const progress = (totalFocusTime / dailyGoal) * 100;
    
    // Streak-based messages
    if (currentStreak >= 30) {
      return {
        title: "You're a Legend! 🔥",
        message: "30+ day streak! You've mastered the art of focus.",
        color: '#ef4444',
      };
    }
    
    if (currentStreak >= 14) {
      return {
        title: "Two Weeks Strong! ⚡",
        message: "Your consistency is inspiring. Keep up the amazing work!",
        color: '#f59e0b',
      };
    }
    
    if (currentStreak >= 7) {
      return {
        title: "Week Warrior! 💪",
        message: "A full week of focus! You're building incredible habits.",
        color: '#2563eb',
      };
    }
    
    if (currentStreak >= 3) {
      return {
        title: "Getting Started! 🚀",
        message: "Great start! Consistency is the key to success.",
        color: '#10b981',
      };
    }
    
    // Progress-based messages
    if (progress >= 100) {
      return {
        title: "Goal Crushed! 🎯",
        message: "You've exceeded your daily goal! Amazing work!",
        color: '#10b981',
      };
    }
    
    if (progress >= 75) {
      return {
        title: "Almost There! 📈",
        message: "You're so close to your daily goal. Push through!",
        color: '#f59e0b',
      };
    }
    
    if (progress >= 50) {
      return {
        title: "Halfway There! 🎯",
        message: "Great progress! You're making steady improvements.",
        color: '#2563eb',
      };
    }
    
    if (progress >= 25) {
      return {
        title: "Getting Started! 🌱",
        message: "Every minute counts. You're building momentum!",
        color: '#8b5cf6',
      };
    }
    
    // Default message
    return {
      title: "Ready to Focus? 🎯",
      message: "Start your first session today and begin your journey!",
      color: '#6b7280',
    };
  };

  const messageData = getMessage();

  return (
    <View style={[styles.container, { borderLeftColor: messageData.color }]}>
      <Text style={[styles.title, { color: messageData.color }]}>
        {messageData.title}
      </Text>
      <Text style={styles.message}>{messageData.message}</Text>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Math.round((totalFocusTime / dailyGoal) * 100)}%</Text>
          <Text style={styles.statLabel}>Daily Goal</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatTime(totalFocusTime)}</Text>
          <Text style={styles.statLabel}>Today's Focus</Text>
        </View>
      </View>
    </View>
  );
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MotivationalMessage; 