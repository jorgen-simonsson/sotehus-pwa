import { CONFIG } from './config.js';
import { elements } from './dom.js';
import { isOnline } from './state.js';
import { formatTimestamp } from './format.js';

let weatherRefreshTimer = null;

// Readings already surfaced by a dedicated field elsewhere on the page —
// everything else in the API response is rendered generically in "More readings".
const FEATURED_KEYS = [
  'outdoor_temp', 'feels_like', 'dew_point', 'outdoor_humidity',
  'wind_speed', 'wind_gust', 'wind_speed_10min_avg', 'wind_direction',
  'piezo_rain_rate', 'piezo_raining', 'piezo_rain_daily', 'piezo_rain_weekly',
  'piezo_rain_monthly', 'piezo_rain_yearly', 'piezo_rain_event', 'piezo_rain_event_total'
];

const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
];

function degreesToCompass(deg) {
  const index = Math.round(deg / 22.5) % 16;
  return COMPASS_POINTS[index];
}

function labelFromKey(key) {
  return key
    .replace(/^piezo_/, '')
    .replace(/^ws90_/, 'sensor ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function startWeatherRefresh() {
  fetchWeatherData();

  if (weatherRefreshTimer) clearInterval(weatherRefreshTimer);
  weatherRefreshTimer = setInterval(() => {
    if (isOnline) {
      fetchWeatherData();
    }
  }, CONFIG.WEATHER_REFRESH_INTERVAL);
}

export function stopWeatherRefresh() {
  if (weatherRefreshTimer) {
    clearInterval(weatherRefreshTimer);
    weatherRefreshTimer = null;
  }
}

async function fetchWeatherData() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/weather`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    updateWeatherUI(data);
    elements.weatherError.textContent = '';
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    elements.weatherError.textContent = `Error: ${error.message}`;
  }
}

function value(readings, key) {
  return readings[key] ? readings[key].value : null;
}

function unitOf(readings, key) {
  return readings[key] ? readings[key].unitOfMeasure : '';
}

function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined) return '--';
  return Number(num).toFixed(decimals);
}

function updateWeatherUI(data) {
  if (!data || !data.readings) return;
  const readings = data.readings;

  // Outdoor temperature
  elements.weatherOutdoorTemp.textContent = formatNumber(value(readings, 'outdoor_temp'));
  elements.weatherOutdoorTempUnit.textContent = unitOf(readings, 'outdoor_temp') || '°C';
  elements.weatherFeelsLike.textContent = `${formatNumber(value(readings, 'feels_like'))}${unitOf(readings, 'feels_like')}`;
  elements.weatherDewPoint.textContent = `${formatNumber(value(readings, 'dew_point'))}${unitOf(readings, 'dew_point')}`;
  elements.weatherOutdoorHumidity.textContent = `${formatNumber(value(readings, 'outdoor_humidity'), 0)}${unitOf(readings, 'outdoor_humidity')}`;

  // Wind
  const windDir = value(readings, 'wind_direction');
  elements.weatherWindSpeed.textContent = formatNumber(value(readings, 'wind_speed'));
  elements.weatherWindUnit.textContent = unitOf(readings, 'wind_speed') || 'm/s';
  elements.weatherWindDirection.textContent = windDir !== null
    ? `${degreesToCompass(windDir)} (${Math.round(windDir)}°)`
    : '--';
  if (elements.weatherWindArrow) {
    // The arrow points in the direction the wind is blowing TOWARD, which is
    // 180° opposite wind_direction (the meteorological "blowing from" bearing).
    elements.weatherWindArrow.style.transform = windDir !== null ? `rotate(${(windDir + 180) % 360}deg)` : '';
  }
  elements.weatherWindGust.textContent = `${formatNumber(value(readings, 'wind_gust'))} ${unitOf(readings, 'wind_gust')}`;
  elements.weatherWindAvg.textContent = `${formatNumber(value(readings, 'wind_speed_10min_avg'))} ${unitOf(readings, 'wind_speed_10min_avg')}`;

  // Rain
  const isRaining = value(readings, 'piezo_raining') > 0;
  elements.weatherRainRate.textContent = formatNumber(value(readings, 'piezo_rain_rate'));
  elements.weatherRainUnit.textContent = unitOf(readings, 'piezo_rain_rate') || 'mm/Hr';
  elements.weatherRainStatus.textContent = isRaining ? '🌧️ Raining' : 'Dry';
  elements.weatherRainStatus.classList.toggle('raining', isRaining);
  elements.weatherRainDaily.textContent = `${formatNumber(value(readings, 'piezo_rain_daily'))} mm`;
  elements.weatherRainWeekly.textContent = `${formatNumber(value(readings, 'piezo_rain_weekly'))} mm`;
  elements.weatherRainMonthly.textContent = `${formatNumber(value(readings, 'piezo_rain_monthly'))} mm`;
  elements.weatherRainYearly.textContent = `${formatNumber(value(readings, 'piezo_rain_yearly'))} mm`;
  elements.weatherRainEvent.textContent = `${formatNumber(value(readings, 'piezo_rain_event'))} mm`;
  elements.weatherRainEventTotal.textContent = `${formatNumber(value(readings, 'piezo_rain_event_total'))} mm`;

  renderOtherReadings(readings);

  if (elements.weatherUpdated) {
    elements.weatherUpdated.textContent = `Last updated: ${formatTimestamp(data.timestamp)}`;
  }
}

function renderOtherReadings(readings) {
  if (!elements.weatherOtherList) return;
  elements.weatherOtherList.innerHTML = '';

  Object.keys(readings)
    .filter(key => !FEATURED_KEYS.includes(key))
    .sort()
    .forEach(key => {
      const reading = readings[key];
      const row = document.createElement('div');
      row.className = 'weather-other-row';

      const label = document.createElement('span');
      label.textContent = labelFromKey(key);

      const val = document.createElement('span');
      const decimals = Number.isInteger(reading.value) ? 0 : 1;
      val.textContent = `${formatNumber(reading.value, decimals)} ${reading.unitOfMeasure}`.trim();

      row.appendChild(label);
      row.appendChild(val);
      elements.weatherOtherList.appendChild(row);
    });
}
