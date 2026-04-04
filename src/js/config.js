export const CONFIG = {
  API_BASE_URL: 'http://sotehus-pi5:8080/api',
  REFRESH_INTERVAL: 1000, // 1 second
  VERSION: '1.7.0'
};

// Shared mutable state
export const state = {
  isOnline: navigator.onLine,
  refreshTimer: null
};
