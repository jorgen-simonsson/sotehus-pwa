import { CONFIG } from './config.js';
import { updateUI, showError } from './dashboard.js';

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
