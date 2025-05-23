export function generateLegend(chart: import("chart.js").Chart): string {
  const { datasets } = chart.data;
  const items = datasets.map((ds: any) => {
    const color = ds.borderColor || ds.backgroundColor || "#000";
    const label = ds.label || "";
    return `<span style="display:inline-flex;align-items:center;margin-right:8px;">
      <span style="background-color:${color};width:10px;height:10px;display:inline-block;margin-right:4px;"></span>${label}
    </span>`;
  });
  return items.join("");
}

export function generateBarLegend(labels: string[], colors: string[]): string {
  const items = labels.map((label, idx) => {
    const color = colors[idx] || "#000";
    return `<span style="display:inline-flex;align-items:center;margin-right:8px;">
      <span style="background-color:${color};width:10px;height:10px;display:inline-block;margin-right:4px;"></span>${label}
    </span>`;
  });
  return items.join("");
}
