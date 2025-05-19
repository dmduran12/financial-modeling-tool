import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { getCssVar } from '../utils/cssVar';

export default function Sparkline({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();
  const prevData = useRef<number[]>([]);

  useEffect(() => {
    if (!ref.current) return;
    const labels = data.map((_, i) => i.toString());
    const color = getCssVar('--accent-primary-500', ref.current) || getCssVar('--cobalt-500', ref.current);

    const ctx = ref.current.getContext('2d');
    if (!ctx) return;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const gradient = ctx.createLinearGradient(0, 0, 0, ref.current.height);
    gradient.addColorStop(0, `rgba(${r},${g},${b},0.18)`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

    if (!chartRef.current) {
      chartRef.current = new Chart(ref.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              data,
              borderColor: color,
              backgroundColor: gradient,
              borderWidth: 4,
              tension: 0.4,
              pointRadius: 0,
              fill: 'origin',
              capBezierPoints: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 6, bottom: 6, left: 0, right: 0 } },
          scales: { x: { display: false }, y: { display: false } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          events: [],
          animation: { duration: 300, easing: 'easeOutQuad' },
        },
      });
      prevData.current = [...data];
    } else if (chartRef.current && !arraysEqual(prevData.current, data)) {
      const c = chartRef.current;
      c.data.labels = labels;
      (c.data.datasets[0].data as number[]) = data;
      (c.data.datasets[0].backgroundColor as any) = gradient;
      c.options!.animation = { duration: 200, easing: 'easeInOutQuad' } as any;
      c.update();
      prevData.current = [...data];
    }
  }, [data]);

  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  return <canvas ref={ref} className="w-full h-9" />;
}
