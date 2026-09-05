import { elements } from './dom.js';
import { closeMenu } from './menu.js';
import { startRefresh, stopRefresh } from './dashboard.js';
import { startSolisRefresh, stopSolisRefresh } from './solis.js';
import { startWeatherRefresh, stopWeatherRefresh } from './weather.js';
import { calculateTimePeriod, fetchCostData } from './cost.js';
import { fetchParams } from './settings.js';

export function showDashboardView() {
  stopSolisRefresh();
  stopWeatherRefresh();
  elements.dashboardView.classList.remove('hidden');
  elements.costView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  elements.solisView.classList.add('hidden');
  elements.weatherView.classList.add('hidden');
  startRefresh();
}

export function showSolisView() {
  stopRefresh();
  stopWeatherRefresh();
  closeMenu();
  elements.dashboardView.classList.add('hidden');
  elements.costView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  elements.weatherView.classList.add('hidden');
  elements.solisView.classList.remove('hidden');
  elements.solisError.textContent = '';
  startSolisRefresh();
}

export function showWeatherView() {
  stopRefresh();
  stopSolisRefresh();
  closeMenu();
  elements.dashboardView.classList.add('hidden');
  elements.costView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  elements.solisView.classList.add('hidden');
  elements.weatherView.classList.remove('hidden');
  elements.weatherError.textContent = '';
  startWeatherRefresh();
}

export function showCostView(period) {
  stopRefresh();
  stopSolisRefresh();
  stopWeatherRefresh();
  closeMenu();
  elements.dashboardView.classList.add('hidden');
  elements.settingsView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.solisView.classList.add('hidden');
  elements.weatherView.classList.add('hidden');
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

export function showSettingsView() {
  stopRefresh();
  stopSolisRefresh();
  stopWeatherRefresh();
  closeMenu();
  elements.dashboardView.classList.add('hidden');
  elements.costView.classList.add('hidden');
  elements.blocksView.classList.add('hidden');
  elements.solisView.classList.add('hidden');
  elements.weatherView.classList.add('hidden');
  elements.settingsView.classList.remove('hidden');

  elements.settingsSpinner.style.display = 'flex';
  elements.settingsError.textContent = '';
  elements.settingsList.classList.add('hidden');
  elements.settingsStatus.textContent = '';

  fetchParams();
}
