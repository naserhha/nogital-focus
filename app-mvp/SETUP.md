# NoGital Focus MVP - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Firebase project

### Step 1: Environment Setup

1. **Install React Native CLI:**
   ```bash
   npm install -g @react-native-community/cli
   ```

2. **Create new React Native project:**
   ```bash
   npx react-native init NoGitalFocusApp --template react-native-template-typescript
   cd NoGitalFocusApp
   ```

3. **Install dependencies:**
   ```bash
   npm install @reduxjs/toolkit react-redux
   npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
   npm install react-native-elements react-native-vector-icons
   npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
   npm install react-native-background-timer react-native-push-notification
   npm install @react-native-async-storage/async-storage
   npm install react-native-svg react-native-chart-kit
   npm install react-native-gesture-handler react-native-reanimated
   npm install react-native-safe-area-context react-native-screens
   ```

### Step 2: Firebase Setup

1. **Create Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create new project: "NoGital Focus"
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Enable Analytics

2. **Download configuration files:**
   - Download `google-services.json` for Android
   - Download `GoogleService-Info.plist` for iOS

3. **Add Firebase config files:**
   ```bash
   # Android
   cp google-services.json android/app/
   
   # iOS
   cp GoogleService-Info.plist ios/NoGitalFocusApp/
   ```

### Step 3: Project Structure

Copy the project structure from the README:

```bash
mkdir -p src/{components,screens,services,store,utils,constants,navigation}
mkdir -p src/components/{Timer,Blocker,Analytics,Common}
mkdir -p src/screens/{Auth,Timer,Blocker,Analytics,Profile}
mkdir -p src/store/slices
mkdir -p assets
```

### Step 4: Copy Source Files

1. **Copy Redux store files:**
   ```bash
   # Copy store configuration and slices
   cp -r app-mvp/src/store/* src/store/
   ```

2. **Copy component files:**
   ```bash
   # Copy timer component
   cp app-mvp/src/components/Timer/PomodoroTimer.tsx src/components/Timer/
   ```

3. **Copy service files:**
   ```bash
   # Copy timer service
   cp app-mvp/src/services/timer.ts src/services/
   ```

### Step 5: Configure Navigation

Create `src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Import your screens here
// import TimerScreen from '../screens/Timer/TimerScreen';
// import BlockerScreen from '../screens/Blocker/BlockerScreen';
// import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
// import ProfileScreen from '../screens/Profile/ProfileScreen';

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Timer" component={TimerScreen} />
      <Tab.Screen name="Blocker" component={BlockerScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
```

### Step 6: Configure App Entry

Update `App.tsx`:

```typescript
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
};

export default App;
```

### Step 7: Platform-Specific Setup

#### Android Setup

1. **Update `android/app/build.gradle`:**
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

2. **Update `android/build.gradle`:**
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
   }
   ```

3. **Add permissions to `android/app/src/main/AndroidManifest.xml`:**
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   <uses-permission android:name="android.permission.VIBRATE" />
   ```

#### iOS Setup

1. **Install pods:**
   ```bash
   cd ios && pod install && cd ..
   ```

2. **Add Firebase to iOS project:**
   - Open `ios/NoGitalFocusApp.xcworkspace` in Xcode
   - Add `GoogleService-Info.plist` to project
   - Configure Firebase in AppDelegate

### Step 8: Run the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## 🔧 Development Workflow

### 1. Timer Implementation
- Start with the PomodoroTimer component
- Add background timer functionality
- Implement session tracking
- Add notifications

### 2. Authentication
- Implement Firebase Auth
- Create login/signup screens
- Add user profile management

### 3. Blocker System
- Start with website blocker (browser extension)
- Implement app blocker for Android
- Add blocked items management

### 4. Analytics
- Create analytics dashboard
- Implement data visualization
- Add progress tracking

### 5. Gamification
- Add points system
- Implement achievements
- Create streak tracking

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Install Detox
npm install -g detox-cli
detox init

# Run E2E tests
detox test
```

## 📱 Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace NoGitalFocusApp.xcworkspace -scheme NoGitalFocusApp -configuration Release -destination generic/platform=iOS -archivePath NoGitalFocusApp.xcarchive archive
```

## 🚨 Common Issues

### Metro Bundler Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

### Android Build Issues
```bash
# Clean Android build
cd android && ./gradlew clean && cd ..
```

### iOS Build Issues
```bash
# Clean iOS build
cd ios && xcodebuild clean && cd ..
```

## 📚 Next Steps

1. **Implement core timer functionality**
2. **Add Firebase integration**
3. **Create UI components**
4. **Add navigation**
5. **Implement state management**
6. **Add testing**
7. **Polish and optimize**

This setup provides a solid foundation for building the NoGital Focus MVP app with all the necessary tools and configurations in place. 