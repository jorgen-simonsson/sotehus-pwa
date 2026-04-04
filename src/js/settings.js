import { CONFIG } from './config.js';
import { elements } from './elements.js';
import { tryParseJson } from './utils.js';

export async function loadSettings() {
  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/params`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const params = await response.json();
    renderSettings(params);
  } catch (error) {
    console.error('Failed to fetch params:', error);
    elements.settingsSpinner.style.display = 'none';
    elements.settingsError.textContent = `Error: ${error.message}`;
  }
}

function renderSettings(params) {
  elements.settingsSpinner.style.display = 'none';
  elements.settingsList.classList.remove('hidden');
  elements.settingsList.innerHTML = '';

  params.forEach(param => {
    const card = document.createElement('div');
    card.className = 'settings-card';

    const label = document.createElement('label');
    label.className = 'settings-label';
    label.textContent = param.description || param.key;
    label.setAttribute('for', 'param-' + param.key);

    let displayValue = param.content;
    let isJsonWrapped = false;
    const parsed = tryParseJson(param.content);
    if (parsed && typeof parsed === 'object' && 'value' in parsed) {
      displayValue = String(parsed.value);
      isJsonWrapped = true;
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'settings-input';
    input.id = 'param-' + param.key;
    input.value = displayValue;
    input.dataset.key = param.key;
    input.dataset.original = displayValue;
    input.dataset.description = param.description || '';
    input.dataset.jsonWrapped = isJsonWrapped ? '1' : '';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'settings-save-btn';
    saveBtn.textContent = 'Save';
    saveBtn.disabled = true;

    input.addEventListener('input', () => {
      saveBtn.disabled = input.value === input.dataset.original;
    });

    saveBtn.addEventListener('click', () => {
      let contentToSave = input.value;
      if (input.dataset.jsonWrapped) {
        const num = Number(contentToSave);
        const val = Number.isNaN(num) ? contentToSave : num;
        contentToSave = JSON.stringify({ value: val });
      }
      saveParam(param.key, input.dataset.description, contentToSave, input, saveBtn);
    });

    card.appendChild(label);
    card.appendChild(input);
    card.appendChild(saveBtn);
    elements.settingsList.appendChild(card);
  });
}

async function saveParam(key, description, content, input, btn) {
  btn.disabled = true;
  elements.settingsStatus.textContent = 'Saving...';
  elements.settingsStatus.className = 'settings-status';

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/params/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, content })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    input.dataset.original = input.value;
    elements.settingsStatus.textContent = 'Saved';
    elements.settingsStatus.className = 'settings-status settings-status-ok';
  } catch (error) {
    console.error('Failed to save param:', error);
    elements.settingsStatus.textContent = `Error: ${error.message}`;
    elements.settingsStatus.className = 'settings-status settings-status-error';
    btn.disabled = false;
  }
}
