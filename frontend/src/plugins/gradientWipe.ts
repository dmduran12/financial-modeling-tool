import { Chart } from 'chart.js/auto';

interface WipeState {
  active: boolean;
  start: number;
  fadeStart: number;
  offset: number;
  alpha: number;
  frame?: number;
}

function getState(chart: Chart): WipeState {
  // @ts-ignore - attach custom state to chart instance
  if (!chart._wipeState) {
    // @ts-ignore
    chart._wipeState = { active: false, start: 0, fadeStart: 0, offset: 0, alpha: 0 } as WipeState;
  }
  // @ts-ignore
  return chart._wipeState as WipeState;
}

const gradientWipe = {
  id: 'gradientWipe',
  start(chart: Chart) {
    const state = getState(chart);
    state.active = true;
    state.start = performance.now();
    state.alpha = 1;
    if (!state.frame) chart.draw();
  },
  stop(chart: Chart) {
    const state = getState(chart);
    state.active = false;
    state.fadeStart = performance.now();
    if (!state.frame) chart.draw();
  },
  afterDatasetsDraw(chart: Chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;

    const state = getState(chart);
    let needRedraw = false;

    if (state.active) {
      const elapsed = (performance.now() - state.start) % 2000;
      state.offset = elapsed / 2000;
      state.alpha = 1;
      needRedraw = true;
    } else if (state.alpha > 0) {
      const fadeElapsed = performance.now() - state.fadeStart;
      state.alpha = Math.max(0, 1 - fadeElapsed / 500);
      needRedraw = state.alpha > 0;
    } else {
      state.offset = 0;
    }

    if (state.alpha > 0) {
      const width = chartArea.right - chartArea.left;
      const height = chartArea.bottom - chartArea.top;
      const gradWidth = width / 3;
      const x = chartArea.left + width * state.offset - gradWidth / 2;

      const gradient = ctx.createLinearGradient(x, 0, x + gradWidth, 0);
      gradient.addColorStop(0, 'transparent');
      gradient.addColorStop(0.5, 'var(--cobalt-500)');
      gradient.addColorStop(1, 'transparent');

      ctx.save();
      ctx.globalCompositeOperation = 'source-atop';
      ctx.globalAlpha = state.alpha;
      ctx.fillStyle = gradient;
      ctx.fillRect(chartArea.left, chartArea.top, width, height);
      ctx.restore();
    }

    if (needRedraw) {
      state.frame = requestAnimationFrame(() => chart.draw());
    } else if (state.frame) {
      cancelAnimationFrame(state.frame);
      state.frame = undefined;
    }
  },
};

export default gradientWipe;
