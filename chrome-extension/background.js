// Background service worker for NoGital Focus Blocker
// Handles website blocking and sync with Firebase

// Default blocked sites
const DEFAULT_BLOCKED_SITES = [
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'youtube.com',
  'reddit.com',
  'tiktok.com',
  'netflix.com',
  'hulu.com',
  'disneyplus.com',
  'amazon.com',
  'ebay.com',
  'etsy.com',
  'pinterest.com',
  'linkedin.com',
  'snapchat.com',
  'whatsapp.com',
  'telegram.org',
  'discord.com',
  'twitch.tv',
  'spotify.com'
];

// Extension state
let blockedSites = [];
let isEnabled = true;
let workModeEnabled = true;
let breakModeEnabled = false;
let syncWithApp = true;
let currentMode = 'work'; // 'work' or 'break'

// Initialize extension
async function initialize() {
  try {
    // Load settings from storage
    const result = await chrome.storage.sync.get([
      'blockedSites',
      'isEnabled',
      'workModeEnabled',
      'breakModeEnabled',
      'syncWithApp',
      'currentMode'
    ]);

    blockedSites = result.blockedSites || DEFAULT_BLOCKED_SITES;
    isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    workModeEnabled = result.workModeEnabled !== undefined ? result.workModeEnabled : true;
    breakModeEnabled = result.breakModeEnabled !== undefined ? result.breakModeEnabled : false;
    syncWithApp = result.syncWithApp !== undefined ? result.syncWithApp : true;
    currentMode = result.currentMode || 'work';

    console.log('NoGital Focus Blocker initialized');
    console.log('Blocked sites:', blockedSites);
    console.log('Current mode:', currentMode);
    console.log('Blocker enabled:', isEnabled);

    // Sync with Firebase if enabled
    if (syncWithApp) {
      await syncWithFirebase();
    }
  } catch (error) {
    console.error('Failed to initialize extension:', error);
  }
}

// Check if a URL should be blocked
function shouldBlockUrl(url) {
  if (!isEnabled) return false;

  // Check if blocker is enabled for current mode
  if (currentMode === 'work' && !workModeEnabled) return false;
  if (currentMode === 'break' && !breakModeEnabled) return false;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return blockedSites.some(site => {
      const blockedSite = site.toLowerCase();
      return hostname === blockedSite || hostname.endsWith('.' + blockedSite);
    });
  } catch (error) {
    console.error('Error parsing URL:', error);
    return false;
  }
}

// Block a website by redirecting to blocked page
function blockWebsite(tabId, url) {
  const blockedPageUrl = chrome.runtime.getURL('blocked-page.html');
  const redirectUrl = `${blockedPageUrl}?original=${encodeURIComponent(url)}`;
  
  chrome.tabs.update(tabId, { url: redirectUrl });
  
  // Show notification
  chrome.action.setBadgeText({ text: '🚫', tabId });
  chrome.action.setBadgeBackgroundColor({ color: '#ef4444', tabId });
}

// Handle web navigation
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId === 0) { // Main frame only
    const shouldBlock = shouldBlockUrl(details.url);
    
    if (shouldBlock) {
      console.log('Blocking website:', details.url);
      blockWebsite(details.tabId, details.url);
      
      // Track blocking event
      trackBlockingEvent(details.url);
    }
  }
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const shouldBlock = shouldBlockUrl(tab.url);
    
    if (shouldBlock) {
      console.log('Blocking website on tab update:', tab.url);
      blockWebsite(tabId, tab.url);
    }
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getSettings':
      sendResponse({
        blockedSites,
        isEnabled,
        workModeEnabled,
        breakModeEnabled,
        syncWithApp,
        currentMode
      });
      break;

    case 'updateSettings':
      updateSettings(request.settings);
      sendResponse({ success: true });
      break;

    case 'addBlockedSite':
      addBlockedSite(request.site);
      sendResponse({ success: true });
      break;

    case 'removeBlockedSite':
      removeBlockedSite(request.site);
      sendResponse({ success: true });
      break;

    case 'setMode':
      setMode(request.mode);
      sendResponse({ success: true });
      break;

    case 'syncWithFirebase':
      syncWithFirebase().then(() => {
        sendResponse({ success: true });
      });
      return true; // Keep message channel open for async response

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

// Update settings
async function updateSettings(newSettings) {
  try {
    blockedSites = newSettings.blockedSites || blockedSites;
    isEnabled = newSettings.isEnabled !== undefined ? newSettings.isEnabled : isEnabled;
    workModeEnabled = newSettings.workModeEnabled !== undefined ? newSettings.workModeEnabled : workModeEnabled;
    breakModeEnabled = newSettings.breakModeEnabled !== undefined ? newSettings.breakModeEnabled : breakModeEnabled;
    syncWithApp = newSettings.syncWithApp !== undefined ? newSettings.syncWithApp : syncWithApp;
    currentMode = newSettings.currentMode || currentMode;

    // Save to storage
    await chrome.storage.sync.set({
      blockedSites,
      isEnabled,
      workModeEnabled,
      breakModeEnabled,
      syncWithApp,
      currentMode
    });

    // Sync with Firebase if enabled
    if (syncWithApp) {
      await syncWithFirebase();
    }

    console.log('Settings updated:', newSettings);
  } catch (error) {
    console.error('Failed to update settings:', error);
  }
}

// Add blocked site
async function addBlockedSite(site) {
  if (!blockedSites.includes(site)) {
    blockedSites.push(site);
    await chrome.storage.sync.set({ blockedSites });
    console.log('Added blocked site:', site);
  }
}

// Remove blocked site
async function removeBlockedSite(site) {
  blockedSites = blockedSites.filter(s => s !== site);
  await chrome.storage.sync.set({ blockedSites });
  console.log('Removed blocked site:', site);
}

// Set current mode
async function setMode(mode) {
  currentMode = mode;
  await chrome.storage.sync.set({ currentMode });
  console.log('Mode set to:', mode);
}

// Track blocking events
function trackBlockingEvent(url) {
  // Send analytics to Firebase or other tracking service
  console.log('Blocked access to:', url);
  
  // You can implement Firebase Analytics here
  // firebase.analytics().logEvent('website_blocked', {
  //   url: url,
  //   mode: currentMode,
  //   timestamp: Date.now()
  // });
}

// Sync with Firebase
async function syncWithFirebase() {
  try {
    // This would implement Firebase sync
    // For now, we'll just log the sync attempt
    console.log('Syncing with Firebase...');
    
    // Example Firebase sync implementation:
    // const userId = await getCurrentUserId();
    // const userDoc = firebase.firestore().collection('users').doc(userId);
    // await userDoc.set({
    //   blockedSites,
    //   blockerConfig: {
    //     isEnabled,
    //     workModeEnabled,
    //     breakModeEnabled,
    //     syncWithApp
    //   },
    //   lastSync: new Date()
    // });
    
    console.log('Firebase sync completed');
  } catch (error) {
    console.error('Failed to sync with Firebase:', error);
  }
}

// Initialize extension when installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('NoGital Focus Blocker installed');
  initialize();
});

// Initialize on startup
initialize(); 