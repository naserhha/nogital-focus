import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { FocusSession } from '../../store/slices/analyticsSlice';

interface SessionHistoryProps {
  sessions: FocusSession[];
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ sessions }) => {
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return sessionDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeRange = (startTime: Date, endTime: Date): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  const getQualityColor = (quality: number): string => {
    if (quality >= 9) return '#10b981';
    if (quality >= 7) return '#f59e0b';
    if (quality >= 5) return '#ef4444';
    return '#6b7280';
  };

  const getQualityText = (quality: number): string => {
    if (quality >= 9) return 'Excellent';
    if (quality >= 7) return 'Good';
    if (quality >= 5) return 'Fair';
    return 'Poor';
  };

  const renderSession = ({ item }: { item: FocusSession }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionDate}>{formatDate(item.startTime)}</Text>
          <Text style={styles.sessionTime}>{formatTimeRange(item.startTime, item.endTime)}</Text>
        </View>
        
        <View style={styles.sessionStats}>
          <Text style={styles.duration}>{formatTime(item.duration)}</Text>
          <View style={[
            styles.qualityBadge,
            { backgroundColor: getQualityColor(item.quality) }
          ]}>
            <Text style={styles.qualityText}>
              {getQualityText(item.quality)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mode</Text>
          <Text style={[
            styles.detailValue,
            { color: item.mode === 'work' ? '#2563eb' : '#10b981' }
          ]}>
            {item.mode === 'work' ? 'Focus' : 'Break'}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Status</Text>
          <Text style={[
            styles.detailValue,
            { color: item.completed ? '#10b981' : '#ef4444' }
          ]}>
            {item.completed ? 'Completed' : 'Interrupted'}
          </Text>
        </View>
        
        {item.interruptions > 0 && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Interruptions</Text>
            <Text style={[styles.detailValue, { color: '#f59e0b' }]}>
              {item.interruptions}
            </Text>
          </View>
        )}
      </View>
      
      {!item.completed && (
        <View style={styles.interruptedBadge}>
          <Text style={styles.interruptedText}>Interrupted</Text>
        </View>
      )}
    </View>
  );

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyTitle}>No Sessions Yet</Text>
        <Text style={styles.emptyMessage}>
          Start your first focus session to see your history here.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sessions}
      renderItem={renderSession}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  sessionItem: {
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
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  sessionStats: {
    alignItems: 'flex-end',
  },
  duration: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 10,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  interruptedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  interruptedText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SessionHistory; 