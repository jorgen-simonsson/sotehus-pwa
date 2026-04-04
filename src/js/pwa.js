import { elements } from './elements.js';

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered:', registration.scope);

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

function updateApp() {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
  }
  globalThis.location.reload();
}

// Make updateApp available globally for inline onclick handler
globalThis.updateApp = updateApp;

let deferredPrompt = null;

export function setupInstallPrompt() {
  globalThis.addEventListener('beforeinstallprompt', (e) => {
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

  globalThis.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    if (elements.installBtn) {
      elements.installBtn.style.display = 'none';
    }
  });
}
