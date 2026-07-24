import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { isOnline } from './state.js';
import { formatTimestamp, formatKw, formatLocalISO, formatShortTime } from './format.js';

let solisRefreshTimer = null;
let solisSocRefreshTimer = null;

export function startSolisRefresh() {
  fetchSolisData();
  fetchSolisSocData();

  if (solisRefreshTimer) clearInterval(solisRefreshTimer);
  solisRefreshTimer = setInterval(() => {
    if (isOnline) {
      fetchSolisData();
    }
  }, CONFIG.REFRESH_INTERVAL);

  if (solisSocRefreshTimer) clearInterval(solisSocRefreshTimer);
  solisSocRefreshTimer = setInterval(() => {
    if (isOnline) {
      fetchSolisSocData();
    }
  }, CONFIG.SOLIS_SOC_REFRESH_INTERVAL);
}

export function stopSolisRefresh() {
  if (solisRefreshTimer) {
    clearInterval(solisRefreshTimer);
    solisRefreshTimer = null;
  }
  if (solisSocRefreshTimer) {
    clearInterval(solisSocRefreshTimer);
    solisSocRefreshTimer = null;
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

// 15-minute aggregation over 24h = 96 data points
const SOC_AGGREGATION_MINUTES = 15;

async function fetchSolisSocData() {
  try {
    const stop = new Date();
    const start = new Date(stop.getTime() - 24 * 60 * 60 * 1000);
    const url = `${CONFIG.API_BASE_URL}/solis/soc`
      + `?start=${encodeURIComponent(formatLocalISO(start))}`
      + `&stop=${encodeURIComponent(formatLocalISO(stop))}`
      + `&am=${SOC_AGGREGATION_MINUTES}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    renderSolisSocChart(data || []);
  } catch (error) {
    console.error('Failed to fetch solis SOC data:', error);
  }
}

let solisSocChartInstance = null;

function renderSolisSocChart(points) {
  if (!elements.solisSocChart || !points.length) return;

  if (solisSocChartInstance) {
    solisSocChartInstance.destroy();
    solisSocChartInstance = null;
  }

  const labels = points.map(p => formatShortTime(p.timestamp));
  const data = points.map(p => p.value);

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#a0a0b0' : '#666666';

  solisSocChartInstance = new Chart(elements.solisSocChart, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Battery SOC (%)',
          data,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          borderWidth: 2,
          pointRadius: 0,
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: textColor, maxRotation: 0, font: { size: 10 }, maxTicksLimit: 6 },
          grid: { color: gridColor }
        },
        y: {
          min: 0,
          max: 100,
          ticks: { color: textColor, font: { size: 10 }, callback: v => v + '%' },
          grid: { color: gridColor }
        }
      }
    }
  });
}
