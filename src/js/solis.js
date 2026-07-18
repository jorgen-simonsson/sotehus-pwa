import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { isOnline } from './state.js';
import { formatTimestamp, formatKw } from './format.js';

let solisRefreshTimer = null;

export function startSolisRefresh() {
  fetchSolisData();

  if (solisRefreshTimer) clearInterval(solisRefreshTimer);
  solisRefreshTimer = setInterval(() => {
    if (isOnline) {
      fetchSolisData();
    }
  }, CONFIG.REFRESH_INTERVAL);
}

export function stopSolisRefresh() {
  if (solisRefreshTimer) {
    clearInterval(solisRefreshTimer);
    solisRefreshTimer = null;
  }
}

async function fetchSolisData() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/solis`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    updateSolisUI(data);
    elements.solisError.textContent = '';
  } catch (error) {
    console.error('Failed to fetch solis data:', error);
    elements.solisError.textContent = `Error: ${error.message}`;
  }
}

// Width (in SVG units) of the battery gauge's fill bar at 100% SOC
const BATTERY_FILL_MAX_WIDTH = 27;
const BATTERY_LOW_THRESHOLD = 15;

function setBatteryFill(rect, soc) {
  if (!rect) return;
  const clamped = Math.max(0, Math.min(100, soc));
  rect.setAttribute('width', ((clamped / 100) * BATTERY_FILL_MAX_WIDTH).toFixed(2));
  rect.classList.toggle('battery-fill-low', clamped < BATTERY_LOW_THRESHOLD);
}

// Toggle an SVG flow line's active/direction state.
// direction 'out' = flow moving away from the hub, 'in' = flow moving toward the hub.
function setFlowLine(line, active, direction) {
  if (!line) return;
  line.classList.toggle('active', active);
  line.classList.toggle('dir-out', active && direction === 'out');
  line.classList.toggle('dir-in', active && direction === 'in');
}

function updateSolisUI(data) {
  if (!data) return;

  // Solar always feeds power into the hub
  elements.solisSolarValue.textContent = `${formatKw(data.solar_power)} kW`;
  setFlowLine(elements.lineSolar, data.solar_power > 0, 'in');

  // Household load always draws power from the hub
  elements.solisLoadValue.textContent = `${formatKw(data.household_load)} kW`;
  setFlowLine(elements.lineLoad, data.household_load > 0, 'out');

  // Negative grid_power = importing (grid -> hub), positive = exporting (hub -> grid)
  const gridImporting = data.grid_power < 0;
  elements.solisGridValue.textContent = `${formatKw(data.grid_power)} kW`;
  elements.solisGridLabel.textContent = gridImporting ? 'Importing' : 'Exporting';
  setFlowLine(elements.lineGrid, data.grid_power !== 0, gridImporting ? 'in' : 'out');

  // Positive battery_power = charging (hub -> battery), negative = discharging (battery -> hub)
  const batteryCharging = data.battery_power >= 0;
  elements.solisBatteryValue.textContent = `${formatKw(data.battery_power)} kW`;
  elements.solisBatteryLabel.textContent =
    data.battery_power === 0 ? 'Standby' : (batteryCharging ? 'Charging' : 'Discharging');
  elements.solisBatterySoc.textContent = `${Math.round(data.battery_soc)}%`;
  setBatteryFill(elements.solisBatteryFillRect, data.battery_soc);
  setFlowLine(elements.lineBattery, data.battery_power !== 0, batteryCharging ? 'out' : 'in');

  if (elements.solisUpdated) {
    elements.solisUpdated.textContent = `Last updated: ${formatTimestamp(data.timestamp)}`;
  }
}
