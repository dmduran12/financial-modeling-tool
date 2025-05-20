import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import { getCssVar } from "../utils/cssVar";
import { arraysEqual } from "../utils/arraysEqual";

interface Props {
  data: number[];
  className?: string;
  onRendered?: () => void;
  color?: string;
  strokeWidth?: number;
}

export default function Sparkline({
  data,
  className = "",
  onRendered,
  color,
  strokeWidth = 2,
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart>();
  const prevData = useRef<number[]>([]);

  useEffect(() => {
    if (!ref.current) return;
    const labels = data.map((_, i) => i.toString());
    const resolvedColor =
      color ||
      getCssVar("--accent-primary-500", ref.current) ||
      getCssVar("--cobalt-500", ref.current);

    const ctx = ref.current.getContext("2d");
    if (!ctx) return;

    const animation = {
      duration: 200,
      easing: "easeInOutQuad",
      onComplete: () => onRendered && onRendered(),
    } as any;

    if (!chartRef.current) {
      chartRef.current = new Chart(ref.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data,
              borderColor: resolvedColor,
              backgroundColor: "transparent",
              borderWidth: strokeWidth,
              tension: 0.4,
              pointRadius: 0,
              fill: false,
              capBezierPoints: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: { padding: { top: 12, bottom: 6, left: 0, right: 0 } },
          scales: { x: { display: false }, y: { display: false } },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          events: [],
          animation,
        },
      });
      prevData.current = [...data];
    } else if (chartRef.current && !arraysEqual(prevData.current, data)) {
      const c = chartRef.current;
      c.data.labels = labels;
      (c.data.datasets[0].data as number[]) = data;
      (c.data.datasets[0].backgroundColor as any) = "transparent";
      (c.data.datasets[0].borderColor as any) = resolvedColor;
      (c.data.datasets[0].borderWidth as any) = strokeWidth;
      c.options!.animation = animation;
      c.update();
      prevData.current = [...data];
    } else if (onRendered) {
      onRendered();
    }
  }, [data, color, strokeWidth]);

  return <canvas ref={ref} className={`w-full ${className}`} height={32} />;
}
