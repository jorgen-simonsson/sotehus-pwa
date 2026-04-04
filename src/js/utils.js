export function formatTimestamp(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('sv-SE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatPower(watts) {
  if (watts >= 1000) {
    return { value: (watts / 1000).toFixed(2), unit: 'kW' };
  }
  return { value: watts.toFixed(1), unit: 'W' };
}

export function formatLocalISO(date) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const pad = n => String(Math.abs(n)).padStart(2, '0');
  const hours = Math.floor(Math.abs(offset) / 60);
  const mins = Math.abs(offset) % 60;
  return date.getFullYear()
    + '-' + pad(date.getMonth() + 1)
    + '-' + pad(date.getDate())
    + 'T' + pad(date.getHours())
    + ':' + pad(date.getMinutes())
    + ':' + pad(date.getSeconds())
    + sign + pad(hours) + ':' + pad(mins);
}

export function formatShortTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('sv-SE', {
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
}

export function calculateTimePeriod(period) {
  const now = new Date();
  let start, stop;

  if (period === 'lastHour') {
    stop = new Date(now);
    start = new Date(now.getTime() - 60 * 60 * 1000);
  } else if (period === 'last24h') {
    stop = new Date(now);
    start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (period === 'lastMonth') {
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
    start = firstOfLastMonth;
    stop = firstOfThisMonth;
  }

  return {
    start: formatLocalISO(start),
    stop: formatLocalISO(stop)
  };
}
