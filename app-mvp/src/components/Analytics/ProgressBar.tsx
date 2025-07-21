import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  title: string;
  current: number;
  target: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  title,
  current,
  target,
  color,
}) => {
  const progress = Math.min((current / target) * 100, 100);
  const percentage = Math.round(progress);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${progress}%`, backgroundColor: color },
          ]}
        />
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.current}>{formatTime(current)}</Text>
        <Text style={styles.target}>of {formatTime(target)}</Text>
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  current: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  target: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
});

export default ProgressBar; 