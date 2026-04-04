import { CONFIG, state } from './config.js';
import { elements } from './elements.js';
import { calculateTimePeriod } from './utils.js';
import { fetchData } from './api.js';
import { fetchCostData } from './cost.js';
import { loadSettings } from './settings.js';

// --- Refresh ---

export function startRefresh() {
  fetchData();

  if (state.refreshTimer) clearInterval(state.refreshTimer);
  state.refreshTimer = setInterval(() => {
    if (state.isOnline) {
      fetchData();
    }
  }, CONFIG.REFRESH_INTERVAL);
}

export function stopRefresh() {
  if (state.refreshTimer) {
    clearInterval(state.refreshTimer);
    state.refreshTimer = null;
  }
}

// --- Menu ---

export function toggleMenu() {
  const isOpen = !elements.menuDropdown.classList.contains('hidden');
  if (isOpen) {
    closeMenu();
  } else {
    elements.menuDropdown.classList.remove('hidden');
    elements.menuOverlay.classList.remove('hidden');
  }
}

export function closeMenu() {
  elements.menuDropdown.classList.add('hidden');
  elements.menuOverlay.classList.add('hidden');
}

// --- View Navigation ---

export function showDashboardView() {
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

  loadSettings();
}

// --- Setup ---

export function setupMenu() {
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
