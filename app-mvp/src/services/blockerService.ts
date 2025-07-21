import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseFirestore } from '@react-native-firebase/firestore';

// Types for blocked items
export interface BlockedItem {
  id: string;
  name: string;
  type: 'app' | 'website';
  packageName?: string; // Android app package name
  url?: string; // Website URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockerConfig {
  isEnabled: boolean;
  workModeEnabled: boolean;
  breakModeEnabled: boolean;
  syncWithExtension: boolean;
}

// Blocker service class
export class BlockerService {
  private static instance: BlockerService;
  private blockedItems: BlockedItem[] = [];
  private config: BlockerConfig = {
    isEnabled: true,
    workModeEnabled: true,
    breakModeEnabled: false,
    syncWithExtension: true,
  };

  static getInstance(): BlockerService {
    if (!BlockerService.instance) {
      BlockerService.instance = new BlockerService();
    }
    return BlockerService.instance;
  }

  // Initialize the blocker service
  async initialize(): Promise<void> {
    try {
      await this.loadBlockedItems();
      await this.loadConfig();
      await this.syncWithFirebase();
    } catch (error) {
      console.error('Failed to initialize blocker service:', error);
    }
  }

  // Load blocked items from local storage
  private async loadBlockedItems(): Promise<void> {
    try {
      const itemsJson = await AsyncStorage.getItem('blockedItems');
      if (itemsJson) {
        this.blockedItems = JSON.parse(itemsJson);
      }
    } catch (error) {
      console.error('Failed to load blocked items:', error);
    }
  }

  // Save blocked items to local storage
  private async saveBlockedItems(): Promise<void> {
    try {
      await AsyncStorage.setItem('blockedItems', JSON.stringify(this.blockedItems));
    } catch (error) {
      console.error('Failed to save blocked items:', error);
    }
  }

  // Load configuration from local storage
  private async loadConfig(): Promise<void> {
    try {
      const configJson = await AsyncStorage.getItem('blockerConfig');
      if (configJson) {
        this.config = { ...this.config, ...JSON.parse(configJson) };
      }
    } catch (error) {
      console.error('Failed to load blocker config:', error);
    }
  }

  // Save configuration to local storage
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('blockerConfig', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save blocker config:', error);
    }
  }

  // Sync with Firebase
  private async syncWithFirebase(): Promise<void> {
    try {
      const userId = 'current-user-id'; // Get from auth service
      const userDoc = FirebaseFirestore().collection('users').doc(userId);
      
      // Get blocked items from Firebase
      const snapshot = await userDoc.collection('blockedItems').get();
      const firebaseItems: BlockedItem[] = [];
      
      snapshot.forEach(doc => {
        firebaseItems.push({ id: doc.id, ...doc.data() } as BlockedItem);
      });

      // Merge with local items
      this.blockedItems = this.mergeBlockedItems(this.blockedItems, firebaseItems);
      await this.saveBlockedItems();
    } catch (error) {
      console.error('Failed to sync with Firebase:', error);
    }
  }

  // Merge local and Firebase items
  private mergeBlockedItems(local: BlockedItem[], firebase: BlockedItem[]): BlockedItem[] {
    const merged = [...local];
    
    firebase.forEach(firebaseItem => {
      const localIndex = merged.findIndex(item => item.id === firebaseItem.id);
      if (localIndex === -1) {
        merged.push(firebaseItem);
      } else {
        // Use the most recently updated item
        const localItem = merged[localIndex];
        if (firebaseItem.updatedAt > localItem.updatedAt) {
          merged[localIndex] = firebaseItem;
        }
      }
    });

    return merged;
  }

  // Add a new blocked item
  async addBlockedItem(item: Omit<BlockedItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlockedItem> {
    const newItem: BlockedItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.blockedItems.push(newItem);
    await this.saveBlockedItems();
    await this.syncToFirebase(newItem);
    
    return newItem;
  }

  // Remove a blocked item
  async removeBlockedItem(itemId: string): Promise<void> {
    this.blockedItems = this.blockedItems.filter(item => item.id !== itemId);
    await this.saveBlockedItems();
    await this.removeFromFirebase(itemId);
  }

  // Update a blocked item
  async updateBlockedItem(itemId: string, updates: Partial<BlockedItem>): Promise<void> {
    const index = this.blockedItems.findIndex(item => item.id === itemId);
    if (index !== -1) {
      this.blockedItems[index] = {
        ...this.blockedItems[index],
        ...updates,
        updatedAt: new Date(),
      };
      await this.saveBlockedItems();
      await this.syncToFirebase(this.blockedItems[index]);
    }
  }

  // Get all blocked items
  getBlockedItems(): BlockedItem[] {
    return this.blockedItems.filter(item => item.isActive);
  }

  // Get blocked items by type
  getBlockedItemsByType(type: 'app' | 'website'): BlockedItem[] {
    return this.blockedItems.filter(item => item.type === type && item.isActive);
  }

  // Check if an app/website is blocked
  isBlocked(identifier: string, type: 'app' | 'website'): boolean {
    if (!this.config.isEnabled) return false;
    
    return this.blockedItems.some(item => 
      item.isActive && 
      item.type === type && 
      (type === 'app' ? item.packageName === identifier : item.url === identifier)
    );
  }

  // Show blocking reminder (platform-specific)
  async showBlockingReminder(item: BlockedItem): Promise<void> {
    const message = `You're trying to access ${item.name} during focus time. Stay focused!`;
    
    Alert.alert(
      'Focus Mode Active',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue Anyway', 
          onPress: () => this.temporarilyAllow(item.id),
          style: 'destructive'
        },
      ]
    );
  }

  // Temporarily allow an item (for 5 minutes)
  private async temporarilyAllow(itemId: string): Promise<void> {
    // Implementation for temporary allowance
    console.log(`Temporarily allowing item: ${itemId}`);
  }

  // Platform-specific blocking methods
  async blockApp(packageName: string, appName: string): Promise<void> {
    if (Platform.OS === 'android') {
      await this.blockAppAndroid(packageName, appName);
    } else {
      await this.blockAppIOS(appName);
    }
  }

  // Android app blocking (using focus mode)
  private async blockAppAndroid(packageName: string, appName: string): Promise<void> {
    try {
      // Add to blocked items
      await this.addBlockedItem({
        name: appName,
        type: 'app',
        packageName,
        isActive: true,
      });

      // Show instructions for manual focus mode setup
      Alert.alert(
        'App Blocking Setup',
        `To block ${appName}, please:\n\n1. Go to Settings > Digital Wellbeing\n2. Set up Focus Mode\n3. Add ${appName} to blocked apps`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to block app on Android:', error);
    }
  }

  // iOS app blocking (limited capabilities)
  private async blockAppIOS(appName: string): Promise<void> {
    try {
      await this.addBlockedItem({
        name: appName,
        type: 'app',
        isActive: true,
      });

      Alert.alert(
        'App Blocking Setup',
        `To block ${appName}, please:\n\n1. Go to Settings > Screen Time\n2. Set up App Limits\n3. Add ${appName} to restricted apps`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to block app on iOS:', error);
    }
  }

  // Sync item to Firebase
  private async syncToFirebase(item: BlockedItem): Promise<void> {
    try {
      const userId = 'current-user-id'; // Get from auth service
      await FirebaseFirestore()
        .collection('users')
        .doc(userId)
        .collection('blockedItems')
        .doc(item.id)
        .set(item);
    } catch (error) {
      console.error('Failed to sync to Firebase:', error);
    }
  }

  // Remove item from Firebase
  private async removeFromFirebase(itemId: string): Promise<void> {
    try {
      const userId = 'current-user-id'; // Get from auth service
      await FirebaseFirestore()
        .collection('users')
        .doc(userId)
        .collection('blockedItems')
        .doc(itemId)
        .delete();
    } catch (error) {
      console.error('Failed to remove from Firebase:', error);
    }
  }

  // Update configuration
  async updateConfig(newConfig: Partial<BlockerConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await this.saveConfig();
  }

  // Get current configuration
  getConfig(): BlockerConfig {
    return { ...this.config };
  }

  // Check if blocker is enabled for current mode
  isEnabledForMode(mode: 'work' | 'break'): boolean {
    if (!this.config.isEnabled) return false;
    
    if (mode === 'work') {
      return this.config.workModeEnabled;
    } else {
      return this.config.breakModeEnabled;
    }
  }
}

export default BlockerService.getInstance(); 