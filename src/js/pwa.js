import { elements } from './dom.js';
import { isOnline, setOnline } from './state.js';
import { fetchData } from './dashboard.js';

// Register Service Worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration.scope);

      // Proactively check for a newer service worker on every load. Without this,
      // an already-controlled page relies solely on the browser's ~24h automatic
      // update-check heuristic (or a visibilitychange event), which lets iOS
      // Safari sit on a stale cache for a long time after a new version deploys.
      registration.update();

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
    }
  }
}

// Show update notification
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'install-banner show';
  notification.innerHTML = `
    <span>A new version is available!</span>
    <button class="btn btn-primary" onclick="updateApp()">Update</button>
    <button class="btn" onclick="this.parentElement.remove()">Later</button>
  `;
  document.body.appendChild(notification);
}

// Update the app
export function updateApp() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  window.location.reload();
}

// Install prompt handling
let deferredPrompt = null;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    if (elements.installBtn) {
      elements.installBtn.style.display = 'inline-block';
    }
  });

  if (elements.installBtn) {
    elements.installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} the install prompt`);

      deferredPrompt = null;
      elements.installBtn.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    if (elements.installBtn) {
      elements.installBtn.style.display = 'none';
    }
  });
}

// Handle visibility change
export function handleVisibilityChange() {
  if (document.visibilityState === 'visible') {
    // App became visible, refresh data
    if (isOnline) {
      fetchData();
    }

    // Check for SW updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }
}

// Update online status
export function updateOnlineStatus() {
  setOnline(navigator.onLine);

  if (elements.offlineStatus) {
    if (isOnline) {
      elements.offlineStatus.textContent = '';
    } else {
      elements.offlineStatus.textContent = '📵 You are offline';
    }
  }

  // Fetch data when coming back online
  if (isOnline) {
    fetchData();
  }
}
