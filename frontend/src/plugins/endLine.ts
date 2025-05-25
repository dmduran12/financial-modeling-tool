import { Chart } from "chart.js/auto";

const endLine = {
  id: "endLine",
  afterDatasetsDraw(chart: Chart) {
    const ctx = chart.ctx;
    const mrrDataset = chart.data.datasets.find((d) => d.label === "MRR");
    const yScale = chart.scales["y1"];
    if (!ctx || !mrrDataset || !yScale) return;
    const data = mrrDataset.data as number[];
    if (!data.length) return;
    const lastValue = data[data.length - 1] as number;
    const y = yScale.getPixelForValue(lastValue);
    if (!y) return;
    ctx.save();
    ctx.strokeStyle = (mrrDataset as any).borderColor || "#000";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chart.chartArea.left, y);
    ctx.lineTo(chart.chartArea.right, y);
    ctx.stroke();
    ctx.restore();
  },
};

export default endLine;
