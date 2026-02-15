// Sotehus PWA - Energy Monitoring Dashboard
// Connects to sotehus-backend API

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://sotehus-pi5:8080/api',
  REFRESH_INTERVAL: 1000, // 1 second
  VERSION: '1.2.1'
};

// State
let isOnline = navigator.onLine;
let refreshTimer = null;

// DOM Elements
const elements = {
  // Price card
  priceSpinner: null,
  priceDisplay: null,
  priceValue: null,
  priceError: null,
  priceUpdated: null,
  
  // Power card
  powerSpinner: null,
  powerDisplay: null,
  powerValue: null,
  powerStatus: null,
  powerError: null,
  powerUpdated: null,
  
  // Solar card
  solarCard: null,
  solarSpinner: null,
  solarDisplay: null,
  solarValue: null,
  solarUnit: null,
  solarStatus: null,
  solarError: null,
  solarUpdated: null,
  
  // Frequency card
  frequencySpinner: null,
  frequencyDisplay: null,
  frequencyValue: null,
  frequencyError: null,
  frequencyUpdated: null,
  
  // Other
  offlineStatus: null,
  versionLabel: null,
  installBtn: null
};

// Initialize DOM elements
function initElements() {
  elements.priceSpinner = document.getElementById('priceSpinner');
  elements.priceDisplay = document.getElementById('priceDisplay');
  elements.priceValue = document.getElementById('priceValue');
  elements.priceError = document.getElementById('priceError');
  elements.priceUpdated = document.getElementById('priceUpdated');
  
  elements.powerSpinner = document.getElementById('powerSpinner');
  elements.powerDisplay = document.getElementById('powerDisplay');
  elements.powerValue = document.getElementById('powerValue');
  elements.powerStatus = document.getElementById('powerStatus');
  elements.powerError = document.getElementById('powerError');
  elements.powerUpdated = document.getElementById('powerUpdated');
  
  elements.solarCard = document.getElementById('solarCard');
  elements.solarSpinner = document.getElementById('solarSpinner');
  elements.solarDisplay = document.getElementById('solarDisplay');
  elements.solarValue = document.getElementById('solarValue');
  elements.solarUnit = document.getElementById('solarUnit');
  elements.solarStatus = document.getElementById('solarStatus');
  elements.solarError = document.getElementById('solarError');
  elements.solarUpdated = document.getElementById('solarUpdated');
  
  elements.frequencySpinner = document.getElementById('frequencySpinner');
  elements.frequencyDisplay = document.getElementById('frequencyDisplay');
  elements.frequencyValue = document.getElementById('frequencyValue');
  elements.frequencyError = document.getElementById('frequencyError');
  elements.frequencyUpdated = document.getElementById('frequencyUpdated');
  
  elements.offlineStatus = document.getElementById('offlineStatus');
  elements.versionLabel = document.getElementById('versionLabel');
  elements.installBtn = document.getElementById('installBtn');
}

// Format timestamp for display
function formatTimestamp(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

// Format power value with appropriate unit
function formatPower(watts) {
  if (watts >= 1000) {
    return { value: (watts / 1000).toFixed(2), unit: 'kW' };
  }
  return { value: watts.toFixed(1), unit: 'W' };
}

// Fetch data from API
async function fetchData() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/data`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    updateUI(data);
    return data;
  } catch (error) {
    console.error('Failed to fetch data:', error);
    showError(error.message);
    return null;
  }
}

// Update the entire UI with API response
function updateUI(data) {
  if (!data) return;
  
  updatePriceUI(data.price);
  updatePowerUI(data.grid);
  updateSolarUI(data.solar);
  updateFrequencyUI(data.frequency);
}

// Update spot price display
function updatePriceUI(priceData) {
  if (!priceData) return;
  
  // Hide spinner, show display
  if (elements.priceSpinner) elements.priceSpinner.style.display = 'none';
  if (elements.priceDisplay) elements.priceDisplay.style.display = 'flex';
  
  if (priceData.valid) {
    if (elements.priceValue) {
      elements.priceValue.textContent = priceData.price.toFixed(2);
    }
    if (elements.priceError) elements.priceError.textContent = '';
    if (elements.priceUpdated) {
      elements.priceUpdated.textContent = `Last updated: ${formatTimestamp(priceData.lastUpdate)}`;
    }
  } else {
    if (elements.priceValue) elements.priceValue.textContent = '--';
    if (elements.priceError) elements.priceError.textContent = 'Price data unavailable';
  }
}

// Update grid power consumption display
function updatePowerUI(gridData) {
  if (!gridData) return;
  
  // Hide spinner, show display
  if (elements.powerSpinner) elements.powerSpinner.style.display = 'none';
  if (elements.powerDisplay) elements.powerDisplay.style.display = 'flex';
  
  if (gridData.valid) {
    const formatted = formatPower(gridData.power);
    if (elements.powerValue) {
      elements.powerValue.textContent = Math.round(gridData.power);
    }
    if (elements.powerStatus) {
      elements.powerStatus.textContent = '🟢 Connected';
      elements.powerStatus.className = 'status-indicator connected';
    }
    if (elements.powerError) elements.powerError.textContent = '';
    if (elements.powerUpdated) {
      elements.powerUpdated.textContent = `Last updated: ${formatTimestamp(gridData.lastUpdate)}`;
    }
  } else {
    if (elements.powerValue) elements.powerValue.textContent = '--';
    if (elements.powerStatus) {
      elements.powerStatus.textContent = gridData.message || 'Connecting...';
      elements.powerStatus.className = 'status-indicator';
    }
    if (elements.powerError && gridData.message) {
      elements.powerError.textContent = gridData.message;
    }
  }
}

// Update solar production display
function updateSolarUI(solarData) {
  if (!solarData) return;
  
  // Hide spinner, show display
  if (elements.solarSpinner) elements.solarSpinner.style.display = 'none';
  if (elements.solarDisplay) elements.solarDisplay.style.display = 'flex';
  
  if (solarData.valid) {
    // API reports solar power in kW, convert to W for display
    const powerInWatts = solarData.power * 1000;
    const formatted = formatPower(powerInWatts);
    if (elements.solarValue) {
      elements.solarValue.textContent = formatted.value;
    }
    if (elements.solarUnit) {
      elements.solarUnit.textContent = formatted.unit;
    }
    if (elements.solarStatus) {
      if (powerInWatts > 0) {
        elements.solarStatus.textContent = '☀️ Producing power';
        elements.solarStatus.className = 'status-indicator producing';
      } else {
        elements.solarStatus.textContent = '🌙 No production';
        elements.solarStatus.className = 'status-indicator no-production';
      }
    }
    if (elements.solarError) elements.solarError.textContent = '';
    if (elements.solarUpdated) {
      elements.solarUpdated.textContent = `Last updated: ${formatTimestamp(solarData.lastUpdate)}`;
    }
  } else {
    if (elements.solarValue) elements.solarValue.textContent = '--';
    if (elements.solarUnit) elements.solarUnit.textContent = 'W';
    if (elements.solarStatus) {
      elements.solarStatus.textContent = solarData.message || 'No solar data';
      elements.solarStatus.className = 'status-indicator';
    }
  }
}

// Update frequency display
function updateFrequencyUI(frequencyData) {
  if (!frequencyData) return;
  
  // Hide spinner, show display
  if (elements.frequencySpinner) elements.frequencySpinner.style.display = 'none';
  if (elements.frequencyDisplay) elements.frequencyDisplay.style.display = 'flex';
  
  if (frequencyData.valid) {
    if (elements.frequencyValue) {
      elements.frequencyValue.textContent = frequencyData.frequency.toFixed(2);
    }
    if (elements.frequencyError) elements.frequencyError.textContent = '';
    if (elements.frequencyUpdated) {
      elements.frequencyUpdated.textContent = `Last updated: ${formatTimestamp(frequencyData.lastUpdate)}`;
    }
  } else {
    if (elements.frequencyValue) elements.frequencyValue.textContent = '--';
    if (elements.frequencyError && frequencyData.message) {
      elements.frequencyError.textContent = frequencyData.message;
    }
  }
}

// Show error message
function showError(message) {
  // Show error on all cards
  if (elements.priceError) elements.priceError.textContent = `Error: ${message}`;
  if (elements.powerError) elements.powerError.textContent = `Error: ${message}`;
  if (elements.solarError) elements.solarError.textContent = `Error: ${message}`;
  if (elements.frequencyError) elements.frequencyError.textContent = `Error: ${message}`;
}

// Start periodic refresh
function startRefresh() {
  // Initial fetch
  fetchData();
  
  // Set up periodic refresh
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if (isOnline) {
      fetchData();
    }
  }, CONFIG.REFRESH_INTERVAL);
}

// Stop periodic refresh
function stopRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// Update online status
function updateOnlineStatus() {
  isOnline = navigator.onLine;
  
  if (elements.offlineStatus) {
    if (isOnline) {
      elements.offlineStatus.textContent = '';
    } else {
      elements.offlineStatus.textContent = '📵 You are offline';
    }
  }
  
  // Fetch data when coming back online
  if (isOnline) {
    fetchData();
  }
}

// Register Service Worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}

// Show update notification
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'install-banner show';
  notification.innerHTML = `
    <span>A new version is available!</span>
    <button class="btn btn-primary" onclick="updateApp()">Update</button>
    <button class="btn" onclick="this.parentElement.remove()">Later</button>
  `;
  document.body.appendChild(notification);
}

// Update the app
function updateApp() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  window.location.reload();
}

// Install prompt handling
let deferredPrompt = null;

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (elements.installBtn) {
      elements.installBtn.style.display = 'inline-block';
    }
  });
  
  if (elements.installBtn) {
    elements.installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);
      
      deferredPrompt = null;
      elements.installBtn.style.display = 'none';
    });
  }
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    if (elements.installBtn) {
      elements.installBtn.style.display = 'none';
    }
  });
}

// Handle visibility change
function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // App became visible, refresh data
    if (isOnline) {
      fetchData();
    }
    
    // Check for SW updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }
}

// Initialize the app
function init() {
  // Initialize DOM elements
  initElements();
  
  // Set version in footer
  if (elements.versionLabel) {
    elements.versionLabel.textContent = `v${CONFIG.VERSION}`;
  }
  
  // Set up event listeners
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Update initial online status
  updateOnlineStatus();
  
  // Register service worker
  registerServiceWorker();
  
  // Setup install prompt
  setupInstallPrompt();
  
  // Start data refresh
  startRefresh();
  
  console.log('Sotehus PWA initialized');
}

// Make updateApp available globally for inline onclick handler
window.updateApp = updateApp;

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
