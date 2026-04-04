// Sotehus PWA - Energy Monitoring Dashboard
// Entry point - orchestrates module initialization

import { CONFIG, state } from './config.js';
import { elements, initElements } from './elements.js';
import { fetchData } from './api.js';
import { registerServiceWorker, setupInstallPrompt } from './pwa.js';
import { setupMenu, startRefresh } from './menu.js';

function updateOnlineStatus() {
  state.isOnline = navigator.onLine;

  if (elements.offlineStatus) {
    if (state.isOnline) {
      elements.offlineStatus.textContent = '';
    } else {
      elements.offlineStatus.textContent = '📵 You are offline';
    }
  }

  if (state.isOnline) {
    fetchData();
  }
}

function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    if (state.isOnline) {
      fetchData();
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }
}

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

function init() {
  initElements();

  if (elements.versionLabel) {
    elements.versionLabel.textContent = `FE v${CONFIG.VERSION}`;
  }
  fetchBackendVersion();
  fetchLocationName();

  globalThis.addEventListener('online', updateOnlineStatus);
  globalThis.addEventListener('offline', updateOnlineStatus);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  updateOnlineStatus();
  registerServiceWorker();
  setupInstallPrompt();
  setupMenu();
  startRefresh();

  console.log('Sotehus PWA initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
