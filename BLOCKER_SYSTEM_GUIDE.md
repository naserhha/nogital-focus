# Website & App Blocker System Guide

A comprehensive blocker system for React Native mobile app and Chrome extension that helps users stay focused by blocking distracting websites and apps.

## 🏗️ System Architecture

### Components Overview

1. **React Native App Blocker**
   - Platform-specific app blocking (Android Focus Mode, iOS Screen Time)
   - Website blocking reminders
   - Firebase sync for cross-platform data
   - Clean UI for managing blocked items

2. **Chrome Extension Blocker**
   - Manifest V3 compliant
   - Real-time website blocking
   - Popup interface for management
   - Sync with mobile app via Firebase

3. **Firebase Sync Service**
   - Real-time data synchronization
   - User authentication integration
   - Cross-platform consistency

## 📱 React Native Implementation

### Core Files

#### 1. Blocker Service (`src/services/blockerService.ts`)
```typescript
// Main service for managing blocked items
export class BlockerService {
  // Singleton pattern for app-wide access
  static getInstance(): BlockerService
  
  // Core functionality
  async addBlockedItem(item: BlockedItem): Promise<BlockedItem>
  async removeBlockedItem(itemId: string): Promise<void>
  async updateBlockedItem(itemId: string, updates: Partial<BlockedItem>): Promise<void>
  
  // Platform-specific blocking
  async blockApp(packageName: string, appName: string): Promise<void>
  async showBlockingReminder(item: BlockedItem): Promise<void>
  
  // Configuration
  async updateConfig(newConfig: Partial<BlockerConfig>): Promise<void>
  getConfig(): BlockerConfig
}
```

#### 2. Blocker Manager UI (`src/components/Blocker/BlockerManager.tsx`)
```typescript
// React Native component for managing blocked items
interface BlockerManagerProps {
  visible: boolean;
  onClose: () => void;
}

// Features:
// - Add/remove blocked sites and apps
// - Toggle blocking settings
// - Sync with Chrome extension
// - Platform-specific instructions
```

### Platform-Specific Implementation

#### Android
```typescript
// Android app blocking using Focus Mode
private async blockAppAndroid(packageName: string, appName: string): Promise<void> {
  // Add to blocked items list
  await this.addBlockedItem({
    name: appName,
    type: 'app',
    packageName,
    isActive: true,
  });

  // Show instructions for manual Focus Mode setup
  Alert.alert(
    'App Blocking Setup',
    `To block ${appName}, please:\n\n1. Go to Settings > Digital Wellbeing\n2. Set up Focus Mode\n3. Add ${appName} to blocked apps`,
    [{ text: 'OK' }]
  );
}
```

#### iOS
```typescript
// iOS app blocking using Screen Time
private async blockAppIOS(appName: string): Promise<void> {
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
}
```

### Usage Example

```typescript
import BlockerManager from './components/Blocker/BlockerManager';
import blockerService from './services/blockerService';

const App = () => {
  const [showBlocker, setShowBlocker] = useState(false);

  const handleAddBlockedSite = async () => {
    await blockerService.addBlockedItem({
      name: 'Facebook',
      type: 'website',
      url: 'facebook.com',
      isActive: true,
    });
  };

  return (
    <View>
      <Button title="Manage Blocker" onPress={() => setShowBlocker(true)} />
      <BlockerManager 
        visible={showBlocker} 
        onClose={() => setShowBlocker(false)} 
      />
    </View>
  );
};
```

## 🌐 Chrome Extension Implementation

### Core Files

#### 1. Manifest (`manifest.json`)
```json
{
  "manifest_version": 3,
  "name": "NoGital Focus Blocker",
  "permissions": ["storage", "tabs", "webNavigation", "activeTab"],
  "host_permissions": ["<all_urls>"],
  "background": { "service_worker": "background.js" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["content.js"] }],
  "action": { "default_popup": "popup.html" }
}
```

#### 2. Background Script (`background.js`)
```javascript
// Service worker for handling website blocking
class BlockerService {
  // Check if URL should be blocked
  shouldBlockUrl(url) {
    // Implementation for URL checking
  }
  
  // Block website by redirecting
  blockWebsite(tabId, url) {
    const blockedPageUrl = chrome.runtime.getURL('blocked-page.html');
    chrome.tabs.update(tabId, { url: blockedPageUrl });
  }
  
  // Handle navigation events
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (this.shouldBlockUrl(details.url)) {
      this.blockWebsite(details.tabId, details.url);
    }
  });
}
```

#### 3. Popup Interface (`popup.html` + `popup.js`)
```javascript
// Popup script for managing blocked sites
class PopupManager {
  async initialize() {
    // Load current settings
    const settings = await chrome.runtime.sendMessage({ action: 'getSettings' });
    this.updateUI(settings);
  }
  
  async addBlockedSite(site) {
    await chrome.runtime.sendMessage({ 
      action: 'addBlockedSite', 
      site: site 
    });
  }
  
  async updateSettings(newSettings) {
    await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings: newSettings 
    });
  }
}
```

### Installation & Setup

1. **Load Extension in Chrome**
   ```bash
   # Navigate to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked"
   # Select the chrome-extension folder
   ```

2. **Configure Blocked Sites**
   - Click extension icon
   - Add sites to blocked list
   - Configure work/break modes

3. **Test Blocking**
   - Try accessing a blocked site
   - Should redirect to blocked page

## 🔄 Firebase Sync Integration

### Data Structure

```typescript
// Firebase Firestore structure
interface UserBlockerData {
  userId: string;
  blockedItems: BlockedItem[];
  config: BlockerConfig;
  lastSync: Date;
  stats: {
    totalBlocks: number;
    todayBlocks: number;
    focusTime: number;
  };
}
```

### Sync Implementation

#### React Native
```typescript
// Sync with Firebase
private async syncWithFirebase(): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    const userDoc = FirebaseFirestore()
      .collection('users')
      .doc(userId);
    
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
```

#### Chrome Extension
```javascript
// Sync with Firebase
async function syncWithFirebase() {
  try {
    const userId = await getCurrentUserId();
    const userDoc = firebase.firestore().collection('users').doc(userId);
    
    await userDoc.set({
      blockedSites,
      blockerConfig: {
        isEnabled,
        workModeEnabled,
        breakModeEnabled,
        syncWithApp
      },
      lastSync: new Date()
    });
    
    console.log('Firebase sync completed');
  } catch (error) {
    console.error('Failed to sync with Firebase:', error);
  }
}
```

## 🚧 Platform Limitations & Workarounds

### React Native Limitations

#### Android
**Limitations:**
- Cannot directly block apps without user setup
- Requires manual Focus Mode configuration
- Limited background monitoring capabilities

**Workarounds:**
```typescript
// Provide clear setup instructions
const showAndroidSetup = (appName: string) => {
  Alert.alert(
    'Setup Required',
    `To block ${appName}:\n\n1. Settings > Digital Wellbeing\n2. Focus Mode > Add ${appName}\n3. Enable Focus Mode`,
    [{ text: 'OK' }]
  );
};

// Use accessibility services for monitoring (requires permissions)
const requestAccessibilityPermission = () => {
  // Request accessibility service permission
  // Monitor app usage for reminders
};
```

#### iOS
**Limitations:**
- Cannot directly block apps
- Screen Time requires manual setup
- Limited background capabilities

**Workarounds:**
```typescript
// Provide Screen Time setup instructions
const showIOSSetup = (appName: string) => {
  Alert.alert(
    'Setup Required',
    `To block ${appName}:\n\n1. Settings > Screen Time\n2. App Limits > Add ${appName}\n3. Set time limit to 0`,
    [{ text: 'OK' }]
  );
};

// Use local notifications for reminders
const scheduleReminder = (appName: string) => {
  // Schedule local notification when app is detected
  // Show focus reminder
};
```

### Chrome Extension Limitations

#### Manifest V3 Restrictions
**Limitations:**
- Service worker instead of background page
- Limited persistent storage
- Restricted API access

**Workarounds:**
```javascript
// Use chrome.storage.sync for data persistence
const saveSettings = async (settings) => {
  await chrome.storage.sync.set(settings);
};

// Use message passing for communication
const sendMessage = async (message) => {
  return await chrome.runtime.sendMessage(message);
};
```

#### Website Blocking Limitations
**Limitations:**
- Cannot block all types of content
- Some sites may bypass blocking
- Limited to HTTP/HTTPS traffic

**Workarounds:**
```javascript
// Multiple blocking strategies
const blockWebsite = (url) => {
  // Strategy 1: Redirect to blocked page
  chrome.tabs.update(tabId, { url: blockedPageUrl });
  
  // Strategy 2: Inject blocking overlay
  chrome.scripting.executeScript({
    target: { tabId },
    func: injectBlockingOverlay
  });
  
  // Strategy 3: Show notification
  chrome.notifications.create({
    type: 'basic',
    title: 'Site Blocked',
    message: 'This site is blocked during focus time'
  });
};
```

## 🧪 Testing & Debugging

### React Native Testing

```typescript
// Unit tests for blocker service
describe('BlockerService', () => {
  it('should add blocked item', async () => {
    const service = BlockerService.getInstance();
    const item = await service.addBlockedItem({
      name: 'Test Site',
      type: 'website',
      url: 'test.com',
      isActive: true,
    });
    
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Test Site');
  });
  
  it('should check if site is blocked', () => {
    const service = BlockerService.getInstance();
    const isBlocked = service.isBlocked('facebook.com', 'website');
    expect(isBlocked).toBe(true);
  });
});
```

### Chrome Extension Testing

```javascript
// Test background script
describe('Background Script', () => {
  it('should block facebook.com', () => {
    const shouldBlock = shouldBlockUrl('https://facebook.com');
    expect(shouldBlock).toBe(true);
  });
  
  it('should not block google.com', () => {
    const shouldBlock = shouldBlockUrl('https://google.com');
    expect(shouldBlock).toBe(false);
  });
});
```

## 📊 Analytics & Monitoring

### Blocking Analytics

```typescript
// Track blocking events
interface BlockingEvent {
  url: string;
  timestamp: Date;
  mode: 'work' | 'break';
  userAction: 'blocked' | 'allowed' | 'temporarily_allowed';
}

// Send to Firebase Analytics
const trackBlockingEvent = (event: BlockingEvent) => {
  firebase.analytics().logEvent('website_blocked', {
    url: event.url,
    mode: event.mode,
    user_action: event.userAction,
    timestamp: event.timestamp
  });
};
```

### Performance Monitoring

```typescript
// Monitor extension performance
const monitorPerformance = () => {
  const startTime = performance.now();
  
  // Perform blocking check
  const shouldBlock = shouldBlockUrl(url);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Log if performance is poor
  if (duration > 100) {
    console.warn(`Blocking check took ${duration}ms`);
  }
};
```

## 🔧 Configuration & Customization

### Environment Variables

```typescript
// Configuration file
export const BLOCKER_CONFIG = {
  // Firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  
  // Default blocked sites
  DEFAULT_BLOCKED_SITES: [
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
    'reddit.com'
  ],
  
  // Sync settings
  SYNC_INTERVAL: 30000, // 30 seconds
  MAX_SYNC_RETRIES: 3,
  
  // UI settings
  SHOW_MOTIVATIONAL_MESSAGES: true,
  ENABLE_STATS: true,
  ENABLE_NOTIFICATIONS: true
};
```

### Custom Blocking Rules

```typescript
// Advanced blocking rules
interface BlockingRule {
  pattern: string; // Regex pattern
  action: 'block' | 'warn' | 'allow';
  mode: 'work' | 'break' | 'both';
  priority: number;
}

const customRules: BlockingRule[] = [
  {
    pattern: '.*\\.facebook\\.com.*',
    action: 'block',
    mode: 'work',
    priority: 1
  },
  {
    pattern: '.*\\.youtube\\.com/watch.*',
    action: 'warn',
    mode: 'work',
    priority: 2
  }
];
```

## 🚀 Deployment & Distribution

### React Native App

1. **Build for Production**
   ```bash
   # Android
   cd android && ./gradlew assembleRelease
   
   # iOS
   cd ios && xcodebuild -workspace App.xcworkspace -scheme App archive
   ```

2. **Publish to Stores**
   - Google Play Store (Android)
   - App Store (iOS)

### Chrome Extension

1. **Package Extension**
   ```bash
   # Create ZIP file
   zip -r nogital-focus-blocker.zip chrome-extension/
   ```

2. **Publish to Chrome Web Store**
   - Upload ZIP file
   - Provide description and screenshots
   - Wait for review

## 🔒 Security Considerations

### Data Privacy

```typescript
// Encrypt sensitive data
import CryptoJS from 'crypto-js';

const encryptData = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

const decryptData = (encryptedData: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
```

### Permission Management

```typescript
// Request minimal permissions
const requestPermissions = async () => {
  const permissions = {
    storage: true,
    notifications: true,
    accessibility: false // Only if needed
  };
  
  // Request only necessary permissions
  const granted = await PermissionsAndroid.requestMultiple(permissions);
  return granted;
};
```

## 📈 Future Enhancements

### Planned Features

1. **AI-Powered Blocking**
   - Machine learning to detect distracting content
   - Smart blocking based on user behavior

2. **Advanced Analytics**
   - Detailed focus time tracking
   - Productivity insights
   - Goal setting and achievement

3. **Cross-Platform Sync**
   - Real-time sync across all devices
   - Cloud backup and restore

4. **Custom Blocking Rules**
   - Regex pattern matching
   - Time-based blocking
   - Conditional blocking

### Integration Opportunities

1. **Calendar Integration**
   - Block based on calendar events
   - Meeting mode blocking

2. **Location-Based Blocking**
   - Block at work, allow at home
   - GPS-based rules

3. **Team Focus Mode**
   - Shared blocking lists
   - Team productivity tracking

This comprehensive blocker system provides a solid foundation for building a productivity-focused app with cross-platform website and app blocking capabilities. 