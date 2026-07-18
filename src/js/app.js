// Sotehus PWA - Energy Monitoring Dashboard
// Connects to sotehus-backend API. Entry point: wires up DOM, views, menu and
// starts the dashboard refresh loop; feature logic lives in the sibling modules.

import { CONFIG } from './config.js';
import { elements, initElements } from './dom.js';
import { startRefresh } from './dashboard.js';
import { showDashboardView, showSolisView, showCostView, showSettingsView } from './views.js';
import { toggleMenu, closeMenu } from './menu.js';
import {
  registerServiceWorker,
  updateApp,
  setupInstallPrompt,
  handleVisibilityChange,
  updateOnlineStatus
} from './pwa.js';
import { fetchBackendVersion, fetchLocationName } from './meta.js';

function setupMenu() {
  elements.menuBtn.addEventListener('click', toggleMenu);
  elements.menuOverlay.addEventListener('click', closeMenu);

  document.getElementById('menuSolis').addEventListener('click', () => {
    showSolisView();
  });

  elements.solisBackBtn.addEventListener('click', showDashboardView);

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

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
