import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart, ProgressChart } from 'react-native-chart-kit';
import {
  fetchTodayStats,
  fetchWeekStats,
  fetchMonthStats,
  fetchSessions,
  selectTodayStats,
  selectWeekStats,
  selectMonthStats,
  selectSessions,
  selectGoals,
  selectStreaks,
  selectLoading,
  selectError,
} from '../../store/slices/analyticsSlice';
import {
  selectPoints,
  selectLevel,
  selectExperience,
  selectAchievements,
  selectDailyChallenges,
  fetchGamificationData,
} from '../../store/slices/gamificationSlice';
import StatsCard from './StatsCard';
import ProgressBar from './ProgressBar';
import AchievementCard from './AchievementCard';
import ChallengeCard from './ChallengeCard';
import SessionHistory from './SessionHistory';
import MotivationalMessage from './MotivationalMessage';

const { width } = Dimensions.get('window');

interface AnalyticsDashboardProps {
  userId: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Analytics selectors
  const todayStats = useSelector(selectTodayStats);
  const weekStats = useSelector(selectWeekStats);
  const monthStats = useSelector(selectMonthStats);
  const sessions = useSelector(selectSessions);
  const goals = useSelector(selectGoals);
  const streaks = useSelector(selectStreaks);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // Gamification selectors
  const points = useSelector(selectPoints);
  const level = useSelector(selectLevel);
  const experience = useSelector(selectExperience);
  const achievements = useSelector(selectAchievements);
  const dailyChallenges = useSelector(selectDailyChallenges);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchTodayStats(userId)),
        dispatch(fetchWeekStats(userId)),
        dispatch(fetchMonthStats(userId)),
        dispatch(fetchSessions({ userId, limit: 20 })),
        dispatch(fetchGamificationData(userId)),
      ]);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Chart data
  const getWeeklyChartData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = [45, 60, 75, 90, 65, 40, 55]; // Mock data
    
    return {
      labels: days,
      datasets: [{
        data,
        color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        strokeWidth: 2,
      }],
    };
  };

  const getMonthlyChartData = () => {
    const weeks = ['W1', 'W2', 'W3', 'W4'];
    const data = [1200, 1400, 1100, 1600]; // Mock data
    
    return {
      labels: weeks,
      datasets: [{
        data,
      }],
    };
  };

  const getProgressData = () => {
    const dailyProgress = todayStats ? (todayStats.totalFocusTime / goals.daily) * 100 : 0;
    const weeklyProgress = weekStats ? (weekStats.totalFocusTime / goals.weekly) * 100 : 0;
    const monthlyProgress = monthStats ? (monthStats.totalFocusTime / goals.monthly) * 100 : 0;
    
    return {
      data: [dailyProgress / 100, weeklyProgress / 100, monthlyProgress / 100],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
    };
  };

  // Format time
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading.today && loading.week && loading.month) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load analytics</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {level}</Text>
        </View>
      </View>

      {/* Motivational Message */}
      <MotivationalMessage 
        currentStreak={streaks.current}
        totalFocusTime={todayStats?.totalFocusTime || 0}
        dailyGoal={goals.daily}
      />

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <StatsCard
          title="Today's Focus"
          value={formatTime(todayStats?.totalFocusTime || 0)}
          subtitle={`${todayStats?.sessions || 0} sessions`}
          icon="⏰"
          color="#2563eb"
        />
        <StatsCard
          title="Current Streak"
          value={`${streaks.current} days`}
          subtitle={`Best: ${streaks.longest} days`}
          icon="🔥"
          color="#f59e0b"
        />
        <StatsCard
          title="Points Earned"
          value={points.toString()}
          subtitle={`Level ${level}`}
          icon="⭐"
          color="#10b981"
        />
      </View>

      {/* Progress Bars */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Goal Progress</Text>
        
        <ProgressBar
          title="Daily Goal"
          current={todayStats?.totalFocusTime || 0}
          target={goals.daily}
          color="#2563eb"
        />
        
        <ProgressBar
          title="Weekly Goal"
          current={weekStats?.totalFocusTime || 0}
          target={goals.weekly}
          color="#f59e0b"
        />
        
        <ProgressBar
          title="Monthly Goal"
          current={monthStats?.totalFocusTime || 0}
          target={goals.monthly}
          color="#ef4444"
        />
      </View>

      {/* Charts */}
      <View style={styles.chartsSection}>
        <Text style={styles.sectionTitle}>Focus Trends</Text>
        
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <Text
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          ))}
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          {selectedPeriod === 'weekly' && (
            <LineChart
              data={getWeeklyChartData()}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#2563eb',
                },
              }}
              bezier
              style={styles.chart}
            />
          )}
          
          {selectedPeriod === 'monthly' && (
            <BarChart
              data={getMonthlyChartData()}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={styles.chart}
            />
          )}
        </View>
      </View>

      {/* Daily Challenges */}
      <View style={styles.challengesSection}>
        <Text style={styles.sectionTitle}>Daily Challenges</Text>
        {dailyChallenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onComplete={(challengeId) => {
              // Handle challenge completion
              Alert.alert('Challenge Complete!', `You earned ${challenge.reward} points!`);
            }}
          />
        ))}
      </View>

      {/* Recent Achievements */}
      <View style={styles.achievementsSection}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.unlocked.slice(0, 5).map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              compact
            />
          ))}
        </ScrollView>
      </View>

      {/* Session History */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <SessionHistory sessions={sessions.slice(0, 10)} />
      </View>

      {/* Detailed Stats */}
      <View style={styles.detailedStats}>
        <Text style={styles.sectionTitle}>Detailed Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Average Session</Text>
            <Text style={styles.statValue}>
              {todayStats ? `${todayStats.averageSessionLength}m` : '0m'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Quality Rating</Text>
            <Text style={styles.statValue}>
              {todayStats ? `${todayStats.quality}/10` : '0/10'}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Interruptions</Text>
            <Text style={styles.statValue}>
              {todayStats?.interruptions || 0}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Best Day</Text>
            <Text style={styles.statValue}>
              {weekStats?.bestDay || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  levelBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  progressSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chartsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
    color: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  challengesSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementsSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historySection: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailedStats: {
    padding: 20,
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});

export default AnalyticsDashboard; 