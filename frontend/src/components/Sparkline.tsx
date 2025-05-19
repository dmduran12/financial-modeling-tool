import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import gradientWipe from '../plugins/gradientWipe';

export default function Sparkline({ data, active = false }: { data: number[]; active?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();
  const animRef = useRef<number>();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.setProperty('--wipe-offset', '0');
    ref.current.style.setProperty('--wipe-opacity', '0');
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
    const el = ref.current;
    if (!el) return;
    const duration = 2000;
    const fadeTime = 500;
    let raf: number;

    const animate = (t: number) => {
      const progress = (t % duration) / duration;
      el.style.setProperty('--wipe-offset', progress.toString());
      raf = requestAnimationFrame(animate);
    };

    const fade = (start: number, ts: number) => {
      const p = (ts - start) / fadeTime;
      const o = Math.max(0, 1 - p);
      el.style.setProperty('--wipe-opacity', o.toString());
      if (p < 1) {
        raf = requestAnimationFrame((newTs) => fade(start, newTs));
      } else {
        el.style.setProperty('--wipe-offset', '0');
      }
    };

    if (active) {
      el.style.setProperty('--wipe-opacity', '1');
      raf = requestAnimationFrame(animate);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const start = performance.now();
      raf = requestAnimationFrame((ts) => fade(start, ts));
    }
    animRef.current = raf;
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return <canvas ref={ref} className={`w-full h-8 sparkline-gradient${active ? ' sparkline-wipe' : ''}`} />;
}
