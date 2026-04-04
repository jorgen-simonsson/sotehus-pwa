import { CONFIG } from './config.js';
import { elements } from './elements.js';
import { formatShortTime } from './utils.js';

export async function fetchCostData(start, stop) {
  try {
    const url = `${CONFIG.API_BASE_URL}/energy/cost?start=${encodeURIComponent(start)}&stop=${encodeURIComponent(stop)}`;
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    const data = await response.json();
    renderCostView(data);
  } catch (error) {
    console.error('Failed to fetch cost data:', error);
    elements.costSpinner.style.display = 'none';
    elements.costError.textContent = `Error: ${error.message}`;
  }
}

function renderCostView(data) {
  elements.costSpinner.style.display = 'none';
  elements.costSummary.classList.remove('hidden');
  elements.showBlocksBtn.classList.remove('hidden');

  elements.costTotalValue.textContent = data.total_cost.toFixed(2);
  elements.costKwh.textContent = data.total_consumed_kwh.toFixed(2) + ' kWh';
  elements.costSoldEnergy.textContent = (data.total_produced_kwh || 0).toFixed(2) + ' kWh';
  elements.costReduction.textContent = (data.production_benefit || 0).toFixed(2) + ' kr';
  elements.costPeriod.textContent =
    formatShortTime(data.period_start) + ' \u2013 ' + formatShortTime(data.period_stop);

  const tbody = elements.costTableBody;
  tbody.innerHTML = '';
  if (data.blocks && data.blocks.length > 0) {
    data.blocks.forEach(block => {
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + formatShortTime(block.start) + '\u2013' + formatShortTime(block.stop) + '</td>'
        + '<td>' + block.spot_price.toFixed(2) + '</td>'
        + '<td>' + block.consumed_kwh.toFixed(2) + '</td>'
        + '<td>' + block.cost.toFixed(2) + '</td>';
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4" style="text-align:center">No data for this period</td>';
    tbody.appendChild(tr);
  }

  renderCostChart(data.blocks || []);
}

let costChartInstance = null;

function renderCostChart(blocks) {
  if (!elements.costChart || !blocks.length) return;

  if (costChartInstance) {
    costChartInstance.destroy();
    costChartInstance = null;
  }

  const labels = blocks.map(b => {
    const d = new Date(b.start);
    return d.toLocaleString('sv-SE', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  });

  const consumedData = blocks.map(b => b.consumed_kwh);
  const producedData = blocks.map(b => b.produced_kwh || 0);
  const costData = blocks.map(b => b.cost);

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const textColor = isDark ? '#a0a0b0' : '#666666';

  costChartInstance = new Chart(elements.costChart, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Consumed (kWh)',
          data: consumedData,
          backgroundColor: 'rgba(153, 27, 27, 0.8)',
          borderRadius: 3,
          order: 2
        },
        {
          label: 'Produced (kWh)',
          data: producedData,
          backgroundColor: 'rgba(30, 58, 138, 0.8)',
          borderRadius: 3,
          order: 3
        },
        {
          label: 'Cost (kr)',
          data: costData,
          type: 'line',
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 2,
          fill: true,
          tension: 0.3,
          yAxisID: 'yCost',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: { color: textColor, boxWidth: 12, font: { size: 11 } }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, maxRotation: 45, font: { size: 10 }, maxTicksLimit: 12 },
          grid: { color: gridColor }
        },
        y: {
          position: 'left',
          title: { display: true, text: 'kWh', color: textColor, font: { size: 11 } },
          ticks: { color: textColor, font: { size: 10 } },
          grid: { color: gridColor }
        },
        yCost: {
          position: 'right',
          title: { display: true, text: 'kr', color: textColor, font: { size: 11 } },
          ticks: { color: textColor, font: { size: 10 } },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}
