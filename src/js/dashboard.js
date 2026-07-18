import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { isOnline } from './state.js';
import { formatTimestamp, formatPower } from './format.js';

let refreshTimer = null;

// Fetch data from API
export async function fetchData() {
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

// Show error message on all cards
function showError(message) {
  if (elements.priceError) elements.priceError.textContent = `Error: ${message}`;
  if (elements.powerError) elements.powerError.textContent = `Error: ${message}`;
  if (elements.solarError) elements.solarError.textContent = `Error: ${message}`;
  if (elements.frequencyError) elements.frequencyError.textContent = `Error: ${message}`;
}

// Start periodic refresh
export function startRefresh() {
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
export function stopRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}
