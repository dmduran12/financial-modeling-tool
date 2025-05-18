import { Chart } from "chart.js";

// Attempt to get palette colors. If DOM is not ready or vars are not defined, will fall back.
let computedPalette = ['#486BFE', '#8262FF', '#D19BEA', '#6EE26A']; // Default fallback from playbook CSS vars
try {
    const rootStyle = getComputedStyle(document.documentElement);
    const paletteVars = [
        "--cat-gradient-a",
        "--cat-gradient-b",
        "--cat-gradient-c",
        "--cat-accent-green"
    ];
    const resolvedPalette = paletteVars.map(v => {
        const color = rootStyle.getPropertyValue(v).trim();
        return color || undefined; // return undefined if empty to filter out later
    });
    
    if (resolvedPalette.every(color => color !== undefined) && resolvedPalette.length === paletteVars.length) {
        computedPalette = resolvedPalette;
    } else {
        console.warn("Chart-manager: Not all palette CSS variables resolved, using fallback. Resolved:", resolvedPalette);
    }
} catch (e) {
    console.warn("Chart-manager: Could not compute palette from CSS variables, using fallback:", e);
}
export const palette = computedPalette;

export function buildArea(ctx, labels, data, col) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        data,
        borderColor: col,
        backgroundColor: `${col}20`, // Playbook: e.g., #RRGGBB20 for 12.5% opacity
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Important for custom sizing
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { 
          grid: { color: "#ECECEC" }, // Playbook defined
          ticks: { callback: v => v != null ? ("$" + v.toLocaleString()) : "$0" } // Playbook defined, ensure v is not null/undefined
        }
      }
    }
  });
}

export function buildPie(ctx, labels, data, cols) {
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{ data, backgroundColor: cols }]
    },
    options: { 
        responsive: true, 
        maintainAspectRatio: false, // Important for custom sizing
        plugins: { legend: { position: "right" } } // Playbook defined
    }
  });
}

