/* ------------------------------------------------------------------
   Chart-manager.js
   – Responsible for building and updating all Chart.js instances
   – Exports the functions used by main.js
------------------------------------------------------------------ */

/* ===== A. Globals ===== */
import Chart from 'chart.js/auto';   // Assumes Chart.js is loaded as an ES-module

// Brand palette (Section F from user request)
export const BRAND_COLORS = [
  '#01426A', // Navy
  '#1174A6', // Sky
  '#9CDBD7', // Mint
  '#FAD89C', // Sand
  '#E67A6A', // Coral
  '#D8C0AE'  // Driftwood-tint
];

// Store chart instances here
const charts = {};

/* ===== B. Init & Resize Helpers (Section C-2 from user request) ===== */
export function initializeCharts() {
  charts.mrr = buildAreaChart('mrrChartContainer');
  charts.customers = buildAreaChart('customersChartContainer');
  charts.tierRevenue = buildPieChart('tierRevenueChartContainer');
  window.addEventListener('resize', () => {
    if (Object.keys(charts).length > 0) { // Check if charts are initialized
       Object.values(charts).forEach(ch => {
           if (ch && typeof ch.resize === 'function') {
               ch.resize()
           }
       });
    }
  });
}

/* ===== C. Update ===== */
export function updateCharts({ projections }) {
  if (!projections || !charts.mrr || !charts.customers || !charts.tierRevenue) {
    console.warn('UpdateCharts called before projections are ready or charts are initialized.');
    return;
  }
  // Reset (Section C-2 & G from user request)
  charts.mrr.data.labels = [...(projections.monthLabels || [])];
  charts.mrr.data.datasets = [{
    label: 'Monthly Recurring Revenue ($)',
    data: [...(projections.mrr_by_month || [])],
    backgroundColor: BRAND_COLORS[1], // Sky
    borderColor: BRAND_COLORS[0], // Navy
    fill: true
  }];

  charts.customers.data.labels = [...(projections.monthLabels || [])];
  charts.customers.data.datasets = [{
    label: 'Customers',
    data: [...(projections.customers_by_month || [])],
    backgroundColor: BRAND_COLORS[2], // Mint
    borderColor: BRAND_COLORS[0], // Navy
    fill: true
  }];

  charts.tierRevenue.data.labels = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
  charts.tierRevenue.data.datasets = [{
    data: [...(projections.tier_revenues_end || [])],
    // Use brandColors for tierRevenueChart (Section F from user request)
    backgroundColor: BRAND_COLORS.slice(0, 4) // T1-T4
  }];
  
  // Note on User Request Section F for customersChart:
  // customersChart.data.datasets.forEach((d,i)=>{d.backgroundColor=brandColors[i];});
  // This is handled by the single dataset already getting BRAND_COLORS[2].
  // If multiple datasets were used, a loop like this would be appropriate.

  Object.values(charts).forEach(ch => {
       if (ch && typeof ch.update === 'function') {
           ch.update('none'); // 'none' for no animation during data reset as per C.2.a
       }
  });
}

/* ===== D. Sparkline helper (optional, if you’re generating them here) ===== */
// Sparkline drawing is managed in main.js as they are not Chart.js instances here.

/* ===== E. Factory fns ===== */
function buildAreaChart(containerId) {
  const container = document.querySelector(`#${containerId}`);
  if (!container) {
      console.error(`Chart container not found: #${containerId}`);
      return null;
  }
  container.innerHTML = ''; // Clear previous canvas if any
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

function buildPieChart(containerId) {
  const container = document.querySelector(`#${containerId}`);
  if (!container) {
      console.error(`Chart container not found: #${containerId}`);
      return null;
  }
  container.innerHTML = ''; // Clear previous canvas if any
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  return new Chart(ctx, {
    type: 'pie',
    data: { labels: [], datasets: [] },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

