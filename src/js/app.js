// Sotehus PWA - Energy Monitoring Dashboard
// Connects to sotehus-backend API

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://sotehus-pi5:8080/api',
  REFRESH_INTERVAL: 1000, // 1 second
  VERSION: '1.7.0'
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
  appTitle: null,
  offlineStatus: null,
  versionLabel: null,
  installBtn: null,

  // Views
  dashboardView: null,
  costView: null,

  // Menu
  menuBtn: null,
  menuOverlay: null,
  menuDropdown: null,

  // Cost view
  costTitle: null,
  costSpinner: null,
  costError: null,
  costSummary: null,
  costTotalValue: null,
  costKwh: null,
  costSoldEnergy: null,
  costReduction: null,
  costPeriod: null,
  costBackBtn: null,
  showBlocksBtn: null,

  // Blocks view
  blocksView: null,
  blocksBackBtn: null,
  costTableBody: null,
  costChart: null,

  // Settings view
  settingsView: null,
  settingsSpinner: null,
  settingsError: null,
  settingsList: null,
  settingsStatus: null,
  settingsBackBtn: null
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
  
  elements.appTitle = document.getElementById('appTitle');
  elements.offlineStatus = document.getElementById('offlineStatus');
  elements.versionLabel = document.getElementById('versionLabel');
  elements.installBtn = document.getElementById('installBtn');

  // Views
  elements.dashboardView = document.getElementById('dashboardView');
  elements.costView = document.getElementById('costView');

  // Menu
  elements.menuBtn = document.getElementById('menuBtn');
  elements.menuOverlay = document.getElementById('menuOverlay');
  elements.menuDropdown = document.getElementById('menuDropdown');

  // Cost view
  elements.costTitle = document.getElementById('costTitle');
  elements.costSpinner = document.getElementById('costSpinner');
  elements.costError = document.getElementById('costError');
  elements.costSummary = document.getElementById('costSummary');
  elements.costTotalValue = document.getElementById('costTotalValue');
  elements.costKwh = document.getElementById('costKwh');
  elements.costSoldEnergy = document.getElementById('costSoldEnergy');
  elements.costReduction = document.getElementById('costReduction');
  elements.costPeriod = document.getElementById('costPeriod');
  elements.costBackBtn = document.getElementById('costBackBtn');
  elements.showBlocksBtn = document.getElementById('showBlocksBtn');

  // Blocks view
  elements.blocksView = document.getElementById('blocksView');
  elements.blocksBackBtn = document.getElementById('blocksBackBtn');
  elements.costTableBody = document.getElementById('costTableBody');
  elements.costChart = document.getElementById('costChart');

  // Settings view
  elements.settingsView = document.getElementById('settingsView');
  elements.settingsSpinner = document.getElementById('settingsSpinner');
  elements.settingsError = document.getElementById('settingsError');
  elements.settingsList = document.getElementById('settingsList');
  elements.settingsStatus = document.getElementById('settingsStatus');
  elements.settingsBackBtn = document.getElementById('settingsBackBtn');
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
  
  // Set version in footer (frontend immediately, backend async)
  if (elements.versionLabel) {
    elements.versionLabel.textContent = `FE v${CONFIG.VERSION}`;
  }
  fetchBackendVersion();
  fetchLocationName();
  
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

  // Setup menu
  setupMenu();
  
  // Start data refresh
  startRefresh();
  
  console.log('Sotehus PWA initialized');
}

// Make updateApp available globally for inline onclick handler
window.updateApp = updateApp;

// --- View Navigation ---

function showDashboardView() {
  elements.dashboardView.classList.remove('hidden');
  elements.costView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  startRefresh();
}

function showCostView(period) {
  stopRefresh();
  closeMenu();
  elements.dashboardView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.costView.classList.remove('hidden');

  // Reset cost view state
  elements.costSpinner.style.display = 'flex';
  elements.costError.textContent = '';
  elements.costSummary.classList.add('hidden');
  elements.showBlocksBtn.classList.add('hidden');

  const labels = {
    lastHour: 'Cost last hour',
    last24h: 'Cost last 24 hours',
    lastMonth: 'Cost last calendar month'
  };
  elements.costTitle.textContent = labels[period] || 'Cost';

  const { start, stop } = calculateTimePeriod(period);
  fetchCostData(start, stop);
}

// --- Menu ---

function toggleMenu() {
  const isOpen = !elements.menuDropdown.classList.contains('hidden');
  if (isOpen) {
    closeMenu();
  } else {
    elements.menuDropdown.classList.remove('hidden');
    elements.menuOverlay.classList.remove('hidden');
  }
}

function closeMenu() {
  elements.menuDropdown.classList.add('hidden');
  elements.menuOverlay.classList.add('hidden');
}

function setupMenu() {
  elements.menuBtn.addEventListener('click', toggleMenu);
  elements.menuOverlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.menu-item[data-period]').forEach(item => {
    item.addEventListener('click', () => {
      showCostView(item.dataset.period);
    });
  });

  elements.costBackBtn.addEventListener('click', showDashboardView);

  elements.showBlocksBtn.addEventListener('click', () => {
    elements.costView.classList.add('hidden');
    elements.blocksView.classList.remove('hidden');
  });

  elements.blocksBackBtn.addEventListener('click', () => {
    elements.blocksView.classList.add('hidden');
    elements.costView.classList.remove('hidden');
  });

  document.getElementById('menuSettings').addEventListener('click', () => {
    showSettingsView();
  });

  document.getElementById('menuForceRefresh').addEventListener('click', async () => {
    closeMenu();
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(r => r.unregister()));
    window.location.reload();
  });

  elements.settingsBackBtn.addEventListener('click', showDashboardView);
}

// --- Cost Data ---

function formatLocalISO(date) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = n => String(Math.abs(n)).padStart(2, '0');
  const hours = Math.floor(Math.abs(offset) / 60);
  const mins = Math.abs(offset) % 60;
  return date.getFullYear()
    + '-' + pad(date.getMonth() + 1)
    + '-' + pad(date.getDate())
    + 'T' + pad(date.getHours())
    + ':' + pad(date.getMinutes())
    + ':' + pad(date.getSeconds())
    + sign + pad(hours) + ':' + pad(mins);
}

function calculateTimePeriod(period) {
  const now = new Date();
  let start, stop;

  if (period === 'lastHour') {
    stop = new Date(now);
    start = new Date(now.getTime() - 60 * 60 * 1000);
  } else if (period === 'last24h') {
    stop = new Date(now);
    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === 'lastMonth') {
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    start = firstOfLastMonth;
    stop = firstOfThisMonth;
  }

  return {
    start: formatLocalISO(start),
    stop: formatLocalISO(stop)
  };
}

async function fetchCostData(start, stop) {
  try {
    const url = `${CONFIG.API_BASE_URL}/energy/cost?start=${encodeURIComponent(start)}&stop=${encodeURIComponent(stop)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    const data = await response.json();
    renderCostView(data);
  } catch (error) {
    console.error('Failed to fetch cost data:', error);
    elements.costSpinner.style.display = 'none';
    elements.costError.textContent = `Error: ${error.message}`;
  }
}

function formatShortTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('sv-SE', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

function renderCostView(data) {
  elements.costSpinner.style.display = 'none';
  elements.costSummary.classList.remove('hidden');
  elements.showBlocksBtn.classList.remove('hidden');

  elements.costTotalValue.textContent = data.total_cost.toFixed(2);
  elements.costKwh.textContent = data.total_consumed_kwh.toFixed(2) + ' kWh';
  elements.costSoldEnergy.textContent = (data.total_produced_kwh || 0).toFixed(2) + ' kWh';
  elements.costReduction.textContent = (data.production_benefit || 0).toFixed(2) + ' kr';
  elements.costPeriod.textContent =
    formatShortTime(data.period_start) + ' \u2013 ' + formatShortTime(data.period_stop);

  // Render blocks table
  const tbody = elements.costTableBody;
  tbody.innerHTML = '';
  if (data.blocks && data.blocks.length > 0) {
    data.blocks.forEach(block => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + formatShortTime(block.start) + '\u2013' + formatShortTime(block.stop) + '</td>'
        + '<td>' + block.spot_price.toFixed(2) + '</td>'
        + '<td>' + block.consumed_kwh.toFixed(2) + '</td>'
        + '<td>' + block.cost.toFixed(2) + '</td>';
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" style="text-align:center">No data for this period</td>';
    tbody.appendChild(tr);
  }

  // Render cost chart
  renderCostChart(data.blocks || []);
}

// Chart instance reference
let costChartInstance = null;

function renderCostChart(blocks) {
  if (!elements.costChart || !blocks.length) return;

  // Destroy previous chart instance
  if (costChartInstance) {
    costChartInstance.destroy();
    costChartInstance = null;
  }

  const labels = blocks.map(b => {
    const d = new Date(b.start);
    return d.toLocaleString('sv-SE', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  });

  const consumedData = blocks.map(b => b.consumed_kwh);
  const producedData = blocks.map(b => b.produced_kwh || 0);
  const costData = blocks.map(b => b.cost);

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#a0a0b0' : '#666666';

  costChartInstance = new Chart(elements.costChart, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Consumed (kWh)',
          data: consumedData,
          backgroundColor: 'rgba(153, 27, 27, 0.8)',
          borderRadius: 3,
          order: 2
        },
        {
          label: 'Produced (kWh)',
          data: producedData,
          backgroundColor: 'rgba(30, 58, 138, 0.8)',
          borderRadius: 3,
          order: 3
        },
        {
          label: 'Cost (kr)',
          data: costData,
          type: 'line',
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 2,
          fill: true,
          tension: 0.3,
          yAxisID: 'yCost',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, maxRotation: 45, font: { size: 10 }, maxTicksLimit: 12 },
          grid: { color: gridColor }
        },
        y: {
          position: 'left',
          title: { display: true, text: 'kWh', color: textColor, font: { size: 11 } },
          ticks: { color: textColor, font: { size: 10 } },
          grid: { color: gridColor }
        },
        yCost: {
          position: 'right',
          title: { display: true, text: 'kr', color: textColor, font: { size: 11 } },
          ticks: { color: textColor, font: { size: 10 } },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}

// --- Settings ---

function showSettingsView() {
  stopRefresh();
  closeMenu();
  elements.dashboardView.classList.add('hidden');
  elements.costView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.settingsView.classList.remove('hidden');

  elements.settingsSpinner.style.display = 'flex';
  elements.settingsError.textContent = '';
  elements.settingsList.classList.add('hidden');
  elements.settingsStatus.textContent = '';

  fetchParams();
}

async function fetchParams() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/params`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const params = await response.json();
    renderSettings(params);
  } catch (error) {
    console.error('Failed to fetch params:', error);
    elements.settingsSpinner.style.display = 'none';
    elements.settingsError.textContent = `Error: ${error.message}`;
  }
}

function renderSettings(params) {
  elements.settingsSpinner.style.display = 'none';
  elements.settingsList.classList.remove('hidden');
  elements.settingsList.innerHTML = '';

  params.forEach(param => {
    const card = document.createElement('div');
    card.className = 'settings-card';

    const label = document.createElement('label');
    label.className = 'settings-label';
    label.textContent = param.description || param.key;
    label.setAttribute('for', 'param-' + param.key);

    // Extract display value from JSON content like {"value": 25}
    let displayValue = param.content;
    let isJsonWrapped = false;
    try {
      const parsed = JSON.parse(param.content);
      if (parsed && typeof parsed === 'object' && 'value' in parsed) {
        displayValue = String(parsed.value);
        isJsonWrapped = true;
      }
    } catch (e) { /* not JSON, use raw */ }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'settings-input';
    input.id = 'param-' + param.key;
    input.value = displayValue;
    input.dataset.key = param.key;
    input.dataset.original = displayValue;
    input.dataset.description = param.description || '';
    input.dataset.jsonWrapped = isJsonWrapped ? '1' : '';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'settings-save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.disabled = true;

    input.addEventListener('input', () => {
      saveBtn.disabled = input.value === input.dataset.original;
    });

    saveBtn.addEventListener('click', () => {
      let contentToSave = input.value;
      if (input.dataset.jsonWrapped) {
        const num = Number(contentToSave);
        const val = isNaN(num) ? contentToSave : num;
        contentToSave = JSON.stringify({ value: val });
      }
      saveParam(param.key, input.dataset.description, contentToSave, input, saveBtn);
    });

    card.appendChild(label);
    card.appendChild(input);
    card.appendChild(saveBtn);
    elements.settingsList.appendChild(card);
  });
}

async function saveParam(key, description, content, input, btn) {
  btn.disabled = true;
  elements.settingsStatus.textContent = 'Saving...';
  elements.settingsStatus.className = 'settings-status';

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/params/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, content })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    input.dataset.original = input.value;
    elements.settingsStatus.textContent = 'Saved';
    elements.settingsStatus.className = 'settings-status settings-status-ok';
  } catch (error) {
    console.error('Failed to save param:', error);
    elements.settingsStatus.textContent = `Error: ${error.message}`;
    elements.settingsStatus.className = 'settings-status settings-status-error';
    btn.disabled = false;
  }
}

// Fetch backend version and display alongside frontend version
async function fetchBackendVersion() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/version`);
    if (!response.ok) return;
    const data = await response.json();
    if (elements.versionLabel && data.version) {
      elements.versionLabel.textContent = `FE v${CONFIG.VERSION} | BE v${data.version}`;
    }
  } catch (e) {
    console.error('Failed to fetch backend version:', e);
  }
}

// Fetch location_name param and set as header title
async function fetchLocationName() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/params/location_name`);
    if (!response.ok) return;
    const param = await response.json();
    let name = param.content;
    try {
      const parsed = JSON.parse(param.content);
      if (parsed && typeof parsed === 'object' && 'value' in parsed) {
        name = String(parsed.value);
      }
    } catch (e) { /* not JSON, use raw */ }
    if (elements.appTitle && name) {
      elements.appTitle.textContent = name;
    }
  } catch (e) {
    console.error('Failed to fetch location name:', e);
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
