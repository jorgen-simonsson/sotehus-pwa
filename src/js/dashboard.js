import { elements } from './elements.js';
import { formatTimestamp, formatPower } from './utils.js';

function setText(el, text) {
  if (el) el.textContent = text;
}

function setStyle(el, prop, value) {
  if (el) el.style[prop] = value;
}

function setClass(el, className) {
  if (el) el.className = className;
}

export function updateUI(data) {
  if (!data) return;

  updatePriceUI(data.price);
  updatePowerUI(data.grid);
  updateSolarUI(data.solar);
  updateFrequencyUI(data.frequency);
}

function updatePriceUI(priceData) {
  if (!priceData) return;

  setStyle(elements.priceSpinner, 'display', 'none');
  setStyle(elements.priceDisplay, 'display', 'flex');

  if (!priceData.valid) {
    setText(elements.priceValue, '--');
    setText(elements.priceError, 'Price data unavailable');
    return;
  }

  setText(elements.priceValue, priceData.price.toFixed(2));
  setText(elements.priceError, '');
  setText(elements.priceUpdated, `Last updated: ${formatTimestamp(priceData.lastUpdate)}`);
}

function updatePowerUI(gridData) {
  if (!gridData) return;

  setStyle(elements.powerSpinner, 'display', 'none');
  setStyle(elements.powerDisplay, 'display', 'flex');

  if (!gridData.valid) {
    setText(elements.powerValue, '--');
    setText(elements.powerStatus, gridData.message || 'Connecting...');
    setClass(elements.powerStatus, 'status-indicator');
    if (gridData.message) setText(elements.powerError, gridData.message);
    return;
  }

  setText(elements.powerValue, Math.round(gridData.power));
  setText(elements.powerStatus, '🟢 Connected');
  setClass(elements.powerStatus, 'status-indicator connected');
  setText(elements.powerError, '');
  setText(elements.powerUpdated, `Last updated: ${formatTimestamp(gridData.lastUpdate)}`);
}

function updateSolarUI(solarData) {
  if (!solarData) return;

  setStyle(elements.solarSpinner, 'display', 'none');
  setStyle(elements.solarDisplay, 'display', 'flex');

  if (!solarData.valid) {
    setText(elements.solarValue, '--');
    setText(elements.solarUnit, 'W');
    setText(elements.solarStatus, solarData.message || 'No solar data');
    setClass(elements.solarStatus, 'status-indicator');
    return;
  }

  const powerInWatts = solarData.power * 1000;
  const formatted = formatPower(powerInWatts);
  const producing = powerInWatts > 0;
  setText(elements.solarValue, formatted.value);
  setText(elements.solarUnit, formatted.unit);
  setText(elements.solarStatus, producing ? '☀️ Producing power' : '🌙 No production');
  setClass(elements.solarStatus, producing ? 'status-indicator producing' : 'status-indicator no-production');
  setText(elements.solarError, '');
  setText(elements.solarUpdated, `Last updated: ${formatTimestamp(solarData.lastUpdate)}`);
}

function updateFrequencyUI(frequencyData) {
  if (!frequencyData) return;

  setStyle(elements.frequencySpinner, 'display', 'none');
  setStyle(elements.frequencyDisplay, 'display', 'flex');

  if (!frequencyData.valid) {
    setText(elements.frequencyValue, '--');
    if (frequencyData.message) setText(elements.frequencyError, frequencyData.message);
    return;
  }

  setText(elements.frequencyValue, frequencyData.frequency.toFixed(2));
  setText(elements.frequencyError, '');
  setText(elements.frequencyUpdated, `Last updated: ${formatTimestamp(frequencyData.lastUpdate)}`);
}

export function showError(message) {
  const text = `Error: ${message}`;
  setText(elements.priceError, text);
  setText(elements.powerError, text);
  setText(elements.solarError, text);
  setText(elements.frequencyError, text);
}
