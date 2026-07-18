// Shared connectivity state. `isOnline` is a live binding: modules that
// import it always see the current value, set via setOnline().
export let isOnline = navigator.onLine;

export function setOnline(value) {
  isOnline = value;
}
