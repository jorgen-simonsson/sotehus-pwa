export const elements = {
  // Price card
  priceSpinner: null,
  priceDisplay: null,
  priceValue: null,
  priceError: null,
  priceUpdated: null,

  // Power card
  powerSpinner: null,
  powerDisplay: null,
  powerValue: null,
  powerStatus: null,
  powerError: null,
  powerUpdated: null,

  // Solar card
  solarCard: null,
  solarSpinner: null,
  solarDisplay: null,
  solarValue: null,
  solarUnit: null,
  solarStatus: null,
  solarError: null,
  solarUpdated: null,

  // Frequency card
  frequencySpinner: null,
  frequencyDisplay: null,
  frequencyValue: null,
  frequencyError: null,
  frequencyUpdated: null,

  // Other
  appTitle: null,
  offlineStatus: null,
  versionLabel: null,
  installBtn: null,

  // Views
  dashboardView: null,
  costView: null,

  // Menu
  menuBtn: null,
  menuOverlay: null,
  menuDropdown: null,

  // Cost view
  costTitle: null,
  costSpinner: null,
  costError: null,
  costSummary: null,
  costTotalValue: null,
  costKwh: null,
  costSoldEnergy: null,
  costReduction: null,
  costPeriod: null,
  costBackBtn: null,
  showBlocksBtn: null,

  // Blocks view
  blocksView: null,
  blocksBackBtn: null,
  costTableBody: null,
  costChart: null,

  // Settings view
  settingsView: null,
  settingsSpinner: null,
  settingsError: null,
  settingsList: null,
  settingsStatus: null,
  settingsBackBtn: null
};

export function initElements() {
  elements.priceSpinner = document.getElementById('priceSpinner');
  elements.priceDisplay = document.getElementById('priceDisplay');
  elements.priceValue = document.getElementById('priceValue');
  elements.priceError = document.getElementById('priceError');
  elements.priceUpdated = document.getElementById('priceUpdated');

  elements.powerSpinner = document.getElementById('powerSpinner');
  elements.powerDisplay = document.getElementById('powerDisplay');
  elements.powerValue = document.getElementById('powerValue');
  elements.powerStatus = document.getElementById('powerStatus');
  elements.powerError = document.getElementById('powerError');
  elements.powerUpdated = document.getElementById('powerUpdated');

  elements.solarCard = document.getElementById('solarCard');
  elements.solarSpinner = document.getElementById('solarSpinner');
  elements.solarDisplay = document.getElementById('solarDisplay');
  elements.solarValue = document.getElementById('solarValue');
  elements.solarUnit = document.getElementById('solarUnit');
  elements.solarStatus = document.getElementById('solarStatus');
  elements.solarError = document.getElementById('solarError');
  elements.solarUpdated = document.getElementById('solarUpdated');

  elements.frequencySpinner = document.getElementById('frequencySpinner');
  elements.frequencyDisplay = document.getElementById('frequencyDisplay');
  elements.frequencyValue = document.getElementById('frequencyValue');
  elements.frequencyError = document.getElementById('frequencyError');
  elements.frequencyUpdated = document.getElementById('frequencyUpdated');

  elements.appTitle = document.getElementById('appTitle');
  elements.offlineStatus = document.getElementById('offlineStatus');
  elements.versionLabel = document.getElementById('versionLabel');
  elements.installBtn = document.getElementById('installBtn');

  // Views
  elements.dashboardView = document.getElementById('dashboardView');
  elements.costView = document.getElementById('costView');

  // Menu
  elements.menuBtn = document.getElementById('menuBtn');
  elements.menuOverlay = document.getElementById('menuOverlay');
  elements.menuDropdown = document.getElementById('menuDropdown');

  // Cost view
  elements.costTitle = document.getElementById('costTitle');
  elements.costSpinner = document.getElementById('costSpinner');
  elements.costError = document.getElementById('costError');
  elements.costSummary = document.getElementById('costSummary');
  elements.costTotalValue = document.getElementById('costTotalValue');
  elements.costKwh = document.getElementById('costKwh');
  elements.costSoldEnergy = document.getElementById('costSoldEnergy');
  elements.costReduction = document.getElementById('costReduction');
  elements.costPeriod = document.getElementById('costPeriod');
  elements.costBackBtn = document.getElementById('costBackBtn');
  elements.showBlocksBtn = document.getElementById('showBlocksBtn');

  // Blocks view
  elements.blocksView = document.getElementById('blocksView');
  elements.blocksBackBtn = document.getElementById('blocksBackBtn');
  elements.costTableBody = document.getElementById('costTableBody');
  elements.costChart = document.getElementById('costChart');

  // Settings view
  elements.settingsView = document.getElementById('settingsView');
  elements.settingsSpinner = document.getElementById('settingsSpinner');
  elements.settingsError = document.getElementById('settingsError');
  elements.settingsList = document.getElementById('settingsList');
  elements.settingsStatus = document.getElementById('settingsStatus');
  elements.settingsBackBtn = document.getElementById('settingsBackBtn');
}
