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
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPoints,
  selectLevel,
  selectExperience,
  selectAchievements,
  selectRewards,
  selectStreaks,
  selectDailyChallenges,
  fetchGamificationData,
  purchaseReward,
  completeDailyChallenge,
} from '../../store/slices/gamificationSlice';
import LevelProgress from './LevelProgress';
import AchievementGrid from './AchievementGrid';
import RewardsShop from './RewardsShop';
import StreakCard from './StreakCard';
import ChallengeList from './ChallengeList';

const { width } = Dimensions.get('window');

interface GamificationDashboardProps {
  userId: string;
}

const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ userId }) => {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'rewards'>('overview');

  // Gamification selectors
  const points = useSelector(selectPoints);
  const level = useSelector(selectLevel);
  const experience = useSelector(selectExperience);
  const achievements = useSelector(selectAchievements);
  const rewards = useSelector(selectRewards);
  const streaks = useSelector(selectStreaks);
  const dailyChallenges = useSelector(selectDailyChallenges);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      await dispatch(fetchGamificationData(userId));
    } catch (error) {
      console.error('Failed to load gamification data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePurchaseReward = async (rewardId: string) => {
    try {
      await dispatch(purchaseReward({ rewardId, userId }));
      Alert.alert('Success', 'Reward purchased successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to purchase reward');
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      await dispatch(completeDailyChallenge(challengeId));
      Alert.alert('Challenge Complete!', 'You earned points!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete challenge');
    }
  };

  const renderOverview = () => (
    <View>
      {/* Level Progress */}
      <LevelProgress
        level={level}
        experience={experience}
        points={points}
      />

      {/* Streak Card */}
      <StreakCard
        currentStreak={streaks.current}
        longestStreak={streaks.longest}
      />

      {/* Daily Challenges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Challenges</Text>
        <ChallengeList
          challenges={dailyChallenges}
          onComplete={handleCompleteChallenge}
        />
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        <AchievementGrid
          achievements={achievements.unlocked.slice(0, 6)}
          compact
        />
      </View>

      {/* Available Rewards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Rewards</Text>
        <RewardsShop
          rewards={rewards.available.slice(0, 3)}
          onPurchase={handlePurchaseReward}
          compact
        />
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{achievements.unlocked.length}</Text>
          <Text style={styles.statLabel}>Unlocked</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{achievements.locked.length}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {Math.round((achievements.unlocked.length / achievements.all.length) * 100)}%
          </Text>
          <Text style={styles.statLabel}>Complete</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Achievements</Text>
        <AchievementGrid
          achievements={achievements.all}
          showProgress
        />
      </View>
    </View>
  );

  const renderRewards = () => (
    <View>
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Your Points</Text>
        <Text style={styles.pointsValue}>{points}</Text>
        <Text style={styles.pointsSubtext}>Available for rewards</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rewards Shop</Text>
        <RewardsShop
          rewards={rewards.all}
          onPurchase={handlePurchaseReward}
        />
      </View>

      {rewards.unlocked.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unlocked Rewards</Text>
          <RewardsShop
            rewards={rewards.unlocked}
            onPurchase={() => {}}
            showUnlocked
          />
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gamification</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>{points} pts</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['overview', 'achievements', 'rewards'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText,
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'rewards' && renderRewards()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  pointsBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingBottom: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2563eb',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pointsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4,
  },
  pointsSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default GamificationDashboard; 