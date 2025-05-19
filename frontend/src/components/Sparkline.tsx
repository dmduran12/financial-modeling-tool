import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import gradientWipe from '../plugins/gradientWipe';
import { getCssVar } from '../utils/cssVar';

export default function Sparkline({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();

  useEffect(() => {
    if (!ref.current) return;
    const labels = data.map((_, i) => i.toString());
    if (!chartRef.current) {
      Chart.register(gradientWipe);
      const color = getCssVar('--cobalt-500', ref.current);
      chartRef.current = new Chart(ref.current, {
        type: 'line',
        data: { labels, datasets: [{ data, borderColor: color, borderWidth: 4, pointRadius: 0 }] },
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

  return <canvas ref={ref} className="w-full h-8 sparkline-gradient" />;
}
