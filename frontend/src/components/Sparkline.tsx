import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import gradientWipe from '../plugins/gradientWipe';

export default function Sparkline({ data, active = false }: { data: number[]; active?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (!ref.current) return;
    const labels = data.map((_, i) => i.toString());
    if (!chartRef.current) {
      Chart.register(gradientWipe);
      chartRef.current = new Chart(ref.current, {
        type: 'line',
        data: { labels, datasets: [{ data, borderColor: 'var(--cobalt-500)', borderWidth: 4, pointRadius: 0 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { display: false }, y: { display: false } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
        plugins: [gradientWipe],
      });
    } else {
      const c = chartRef.current;
      c.data.labels = labels;
      (c.data.datasets[0].data as number[]) = data;
      c.update();
    }
  }, [data]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (active) {
      gradientWipe.start(chartRef.current);
    } else {
      gradientWipe.stop(chartRef.current);
    }
  }, [active]);

  return <canvas ref={ref} className="w-full h-8" />;
}
