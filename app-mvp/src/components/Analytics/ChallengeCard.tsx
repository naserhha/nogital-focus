import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
  reward: number;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (challengeId: string) => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  onComplete,
}) => {
  const progress = Math.min((challenge.current / challenge.target) * 100, 100);
  const percentage = Math.round(progress);

  const getProgressColor = () => {
    if (challenge.completed) return '#10b981';
    if (progress >= 75) return '#f59e0b';
    if (progress >= 50) return '#2563eb';
    return '#6b7280';
  };

  const formatTarget = (target: number) => {
    if (target >= 60) {
      const hours = Math.floor(target / 60);
      const minutes = target % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${target}m`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        challenge.completed && styles.completed,
      ]}
      onPress={() => !challenge.completed && onComplete(challenge.id)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{challenge.title}</Text>
          {challenge.completed && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓</Text>
            </View>
          )}
        </View>
        <Text style={styles.reward}>+{challenge.reward} pts</Text>
      </View>
      
      <Text style={styles.description}>{challenge.description}</Text>
      
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {challenge.current}/{challenge.target}
          </Text>
          <Text style={styles.percentage}>{percentage}%</Text>
        </View>
        
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
              },
            ]}
          />
        </View>
        
        <Text style={styles.targetText}>
          Target: {formatTarget(challenge.target)}
        </Text>
      </View>
      
      {challenge.completed && (
        <View style={styles.completedOverlay}>
          <Text style={styles.completedMessage}>Challenge Complete!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  completed: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reward: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  targetText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  completedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10b981',
  },
});

export default ChallengeCard; 