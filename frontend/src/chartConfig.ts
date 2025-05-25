import { Chart } from "chart.js/auto";
import endLine from "./plugins/endLine";

export function setupChartDefaults() {
  const styles = getComputedStyle(document.documentElement);
  const gridColor = styles.getPropertyValue("--color-neutral-200") || "#CAC9C5";
  const textColor = styles.getPropertyValue("--color-neutral-900") || "#1E1D1B";
  const tooltipBg = styles.getPropertyValue("--color-neutral-900") || "#1E1D1B";
  const tooltipText =
    styles.getPropertyValue("--color-neutral-50") || "#FDFCFA";

  Chart.defaults.color = textColor.trim();
  Chart.defaults.font.family = "Roboto Mono, monospace";
  Chart.defaults.elements.line.borderWidth = 4;
  Chart.defaults.elements.line.borderCapStyle = "round";
  Chart.defaults.elements.line.fill = false;
  Chart.defaults.elements.line.pointRadius = 0;
  Chart.defaults.elements.bar.borderRadius = 8;
  Chart.defaults.datasets.bar.categoryPercentage = 0.8;
  Chart.register(endLine);
  Chart.defaults.plugins.legend.display = true;
  Chart.defaults.plugins.tooltip.backgroundColor = tooltipBg.trim();
  Chart.defaults.plugins.tooltip.titleColor = tooltipText.trim();
  Chart.defaults.plugins.tooltip.bodyColor = tooltipText.trim();
  Chart.defaults.plugins.tooltip.cornerRadius = 4;
  Chart.defaults.plugins.tooltip.titleFont = { size: 12 } as any;
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 } as any;
  Chart.defaults.scales = {
    x: { grid: { color: gridColor.trim(), lineWidth: 1, display: false } },
    y: { grid: { color: gridColor.trim(), lineWidth: 1 }, beginAtZero: true },
  } as any;
}
