import { Chart } from 'chart.js/auto';

const gradientWipe = {
  id: 'gradientWipe',
  afterDatasetsDraw(chart: Chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const styles = getComputedStyle(chart.canvas);
    const offsetStr = styles.getPropertyValue('--wipe-offset');
    const flashStr = styles.getPropertyValue('--flash-opacity');
    const offset = parseFloat(offsetStr) || 0;
    const flash = parseFloat(flashStr) || 0;
    const width = chartArea.right - chartArea.left;
    const height = chartArea.bottom - chartArea.top;
    const gradWidth = width / 3;
    const x = chartArea.left + width * offset - gradWidth / 2;

    const gradient = ctx.createLinearGradient(x, 0, x + gradWidth, 0);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, 'var(--cobalt-500)');
    gradient.addColorStop(1, 'transparent');

    ctx.save();
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = gradient;
    ctx.fillRect(chartArea.left, chartArea.top, width, height);

    if (flash > 0) {
      ctx.globalAlpha = flash;
      ctx.fillStyle = 'var(--cobalt-500)';
      ctx.fillRect(chartArea.left, chartArea.top, width, height);
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  },
};

export default gradientWipe;
