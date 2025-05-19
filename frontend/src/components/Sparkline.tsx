import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

export default function Sparkline({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (!ref.current) return;
    const labels = data.map((_, i) => i.toString());
    if (!chartRef.current) {
      chartRef.current = new Chart(ref.current, {
        type: 'line',
        data: { labels, datasets: [{ data, borderColor: 'var(--accent-primary-500)', borderWidth: 2, pointRadius: 0 }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { display: false }, y: { display: false } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
        },
      });
    } else {
      const c = chartRef.current;
      c.data.labels = labels;
      (c.data.datasets[0].data as number[]) = data;
      c.update();
    }
  }, [data]);

  return <canvas ref={ref} className="w-full h-8" />;
}
