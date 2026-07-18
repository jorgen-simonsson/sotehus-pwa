import { CONFIG } from './config.js';
import { elements } from './dom.js';

// Fetch backend version and display alongside frontend version
export async function fetchBackendVersion() {
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
export async function fetchLocationName() {
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
