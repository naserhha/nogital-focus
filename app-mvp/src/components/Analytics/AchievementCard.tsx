import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../../store/slices/gamificationSlice';

interface AchievementCardProps {
  achievement: Achievement;
  compact?: boolean;
  onPress?: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  compact = false,
  onPress,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'focus': return '#2563eb';
      case 'streak': return '#f59e0b';
      case 'time': return '#10b981';
      case 'quality': return '#8b5cf6';
      case 'special': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const CardContent = () => (
    <View style={[
      styles.container,
      compact && styles.compact,
      { borderColor: getCategoryColor(achievement.category) }
    ]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{achievement.icon}</Text>
        {achievement.unlocked && (
          <View style={styles.unlockedBadge}>
            <Text style={styles.unlockedText}>✓</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={compact ? 1 : 2}>
          {achievement.name}
        </Text>
        
        {!compact && (
          <Text style={styles.description} numberOfLines={2}>
            {achievement.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <Text style={styles.points}>+{achievement.points} pts</Text>
          {!achievement.unlocked && (
            <Text style={styles.progress}>
              {achievement.current}/{achievement.required}
            </Text>
          )}
        </View>
      </View>
      
      {!achievement.unlocked && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${achievement.progress}%`,
                backgroundColor: getCategoryColor(achievement.category),
              },
            ]}
          />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: 12,
    minWidth: 140,
  },
  compact: {
    padding: 12,
    minWidth: 120,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10b981',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  progress: {
    fontSize: 11,
    color: '#6b7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default AchievementCard; 