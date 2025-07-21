// Popup script for NoGital Focus Blocker
// Handles UI interactions and communicates with background script

// DOM elements
const statusIndicator = document.getElementById('statusIndicator');
const workModeBtn = document.getElementById('workModeBtn');
const breakModeBtn = document.getElementById('breakModeBtn');
const enableBlocker = document.getElementById('enableBlocker');
const workModeEnabled = document.getElementById('workModeEnabled');
const breakModeEnabled = document.getElementById('breakModeEnabled');
const syncWithApp = document.getElementById('syncWithApp');
const sitesList = document.getElementById('sitesList');
const addSiteBtn = document.getElementById('addSiteBtn');
const addSiteModal = document.getElementById('addSiteModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const siteUrlInput = document.getElementById('siteUrl');
const blockedCount = document.getElementById('blockedCount');
const todayBlocks = document.getElementById('todayBlocks');
const syncBtn = document.getElementById('syncBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Current settings
let currentSettings = {
  blockedSites: [],
  isEnabled: true,
  workModeEnabled: true,
  breakModeEnabled: false,
  syncWithApp: true,
  currentMode: 'work'
};

// Initialize popup
async function initialize() {
  try {
    // Get current settings from background script
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    currentSettings = response;
    
    // Update UI with current settings
    updateUI();
    
    // Load blocked sites list
    loadBlockedSites();
    
    // Load stats
    loadStats();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
}

// Update UI with current settings
function updateUI() {
  // Update status indicator
  const statusDot = statusIndicator.querySelector('.status-dot');
  const statusText = statusIndicator.querySelector('.status-text');
  
  if (currentSettings.isEnabled) {
    statusDot.className = 'status-dot active';
    statusText.textContent = 'Active';
  } else {
    statusDot.className = 'status-dot inactive';
    statusText.textContent = 'Inactive';
  }

  // Update mode buttons
  workModeBtn.classList.toggle('active', currentSettings.currentMode === 'work');
  breakModeBtn.classList.toggle('active', currentSettings.currentMode === 'break');

  // Update checkboxes
  enableBlocker.checked = currentSettings.isEnabled;
  workModeEnabled.checked = currentSettings.workModeEnabled;
  breakModeEnabled.checked = currentSettings.breakModeEnabled;
  syncWithApp.checked = currentSettings.syncWithApp;

  // Update blocked count
  blockedCount.textContent = currentSettings.blockedSites.length;
}

// Load blocked sites list
function loadBlockedSites() {
  sitesList.innerHTML = '';
  
  currentSettings.blockedSites.forEach(site => {
    const siteElement = createSiteElement(site);
    sitesList.appendChild(siteElement);
  });
}

// Create site element
function createSiteElement(site) {
  const siteDiv = document.createElement('div');
  siteDiv.className = 'site-item';
  
  siteDiv.innerHTML = `
    <div class="site-info">
      <span class="site-name">${site}</span>
      <span class="site-status">Blocked</span>
    </div>
    <button class="remove-btn" data-site="${site}">Remove</button>
  `;
  
  // Add remove event listener
  const removeBtn = siteDiv.querySelector('.remove-btn');
  removeBtn.addEventListener('click', () => removeSite(site));
  
  return siteDiv;
}

// Load stats
function loadStats() {
  // This would load from storage or analytics
  // For now, we'll use placeholder values
  todayBlocks.textContent = '0';
}

// Event listeners
workModeBtn.addEventListener('click', () => setMode('work'));
breakModeBtn.addEventListener('click', () => setMode('break'));

enableBlocker.addEventListener('change', () => updateSetting('isEnabled', enableBlocker.checked));
workModeEnabled.addEventListener('change', () => updateSetting('workModeEnabled', workModeEnabled.checked));
breakModeEnabled.addEventListener('change', () => updateSetting('breakModeEnabled', breakModeEnabled.checked));
syncWithApp.addEventListener('change', () => updateSetting('syncWithApp', syncWithApp.checked));

addSiteBtn.addEventListener('click', () => {
  addSiteModal.style.display = 'block';
  siteUrlInput.focus();
});

closeModalBtn.addEventListener('click', closeModal);
cancelAddBtn.addEventListener('click', closeModal);

confirmAddBtn.addEventListener('click', addSite);

syncBtn.addEventListener('click', syncWithFirebase);
settingsBtn.addEventListener('click', openAdvancedSettings);

// Close modal
function closeModal() {
  addSiteModal.style.display = 'none';
  siteUrlInput.value = '';
}

// Set mode
async function setMode(mode) {
  try {
    await chrome.runtime.sendMessage({ action: 'setMode', mode });
    currentSettings.currentMode = mode;
    updateUI();
  } catch (error) {
    console.error('Failed to set mode:', error);
  }
}

// Update setting
async function updateSetting(key, value) {
  try {
    const newSettings = { ...currentSettings, [key]: value };
    await chrome.runtime.sendMessage({ 
      action: 'updateSettings', 
      settings: newSettings 
    });
    currentSettings = newSettings;
    updateUI();
  } catch (error) {
    console.error('Failed to update setting:', error);
  }
}

// Add site
async function addSite() {
  const site = siteUrlInput.value.trim().toLowerCase();
  
  if (!site) {
    alert('Please enter a website URL');
    return;
  }
  
  // Basic URL validation
  if (!isValidDomain(site)) {
    alert('Please enter a valid domain name (e.g., facebook.com)');
    return;
  }
  
  try {
    await chrome.runtime.sendMessage({ action: 'addBlockedSite', site });
    
    // Update local state
    if (!currentSettings.blockedSites.includes(site)) {
      currentSettings.blockedSites.push(site);
      updateUI();
      loadBlockedSites();
    }
    
    closeModal();
  } catch (error) {
    console.error('Failed to add site:', error);
    alert('Failed to add site');
  }
}

// Remove site
async function removeSite(site) {
  if (confirm(`Are you sure you want to remove ${site} from blocked sites?`)) {
    try {
      await chrome.runtime.sendMessage({ action: 'removeBlockedSite', site });
      
      // Update local state
      currentSettings.blockedSites = currentSettings.blockedSites.filter(s => s !== site);
      updateUI();
      loadBlockedSites();
    } catch (error) {
      console.error('Failed to remove site:', error);
      alert('Failed to remove site');
    }
  }
}

// Sync with Firebase
async function syncWithFirebase() {
  try {
    syncBtn.textContent = 'Syncing...';
    syncBtn.disabled = true;
    
    await chrome.runtime.sendMessage({ action: 'syncWithFirebase' });
    
    syncBtn.textContent = 'Sync Complete!';
    setTimeout(() => {
      syncBtn.textContent = 'Sync Now';
      syncBtn.disabled = false;
    }, 2000);
  } catch (error) {
    console.error('Failed to sync:', error);
    syncBtn.textContent = 'Sync Failed';
    setTimeout(() => {
      syncBtn.textContent = 'Sync Now';
      syncBtn.disabled = false;
    }, 2000);
  }
}

// Open advanced settings
function openAdvancedSettings() {
  // This could open a new tab with detailed settings
  chrome.tabs.create({ url: 'options.html' });
}

// Validate domain
function isValidDomain(domain) {
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === addSiteModal) {
    closeModal();
  }
});

// Handle Enter key in input
siteUrlInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    addSite();
  }
});

// Initialize popup when loaded
document.addEventListener('DOMContentLoaded', initialize); 