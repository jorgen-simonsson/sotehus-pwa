import { elements } from './dom.js';

export function toggleMenu() {
  const isOpen = !elements.menuDropdown.classList.contains('hidden');
  if (isOpen) {
    closeMenu();
  } else {
    elements.menuDropdown.classList.remove('hidden');
    elements.menuOverlay.classList.remove('hidden');
  }
}

export function closeMenu() {
  elements.menuDropdown.classList.add('hidden');
  elements.menuOverlay.classList.add('hidden');
}
