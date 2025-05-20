import { useEffect, useRef, useState } from "react";
import Sparkline from "./Sparkline";
import { formatNumberShort, formatCurrency } from "../utils/format";

interface Props {
  labelTop: string;
  labelBottom?: string;
  value: number | string;
  dataArray: number[];
  unit?: "currency" | "percent";
  className?: string;
  warning?: boolean;
}

export default function KPIChip({
  labelTop,
  labelBottom,
  value,
  dataArray,
  unit,
  className = "",
  warning = false,
}: Props) {
  const [refreshing, setRefreshing] = useState(true);
  const prevData = useRef<number[]>([]);

  useEffect(() => {
    if (!arraysEqual(prevData.current, dataArray)) {
      setRefreshing(true);
      prevData.current = [...dataArray];
    }
  }, [dataArray]);

  const handleRendered = () => {
    setTimeout(() => setRefreshing(false), 400);
  };

  const displayValue =
    typeof value === "number"
      ? unit === "currency"
        ? "$" + formatCurrency(value)
        : unit === "percent"
          ? value.toFixed(2) + "%"
          : formatNumberShort(value)
      : value;

  const sparkData = [...dataArray];

  const trendUp = sparkData[sparkData.length - 1] >= sparkData[0];
  const sparkColor = trendUp ? "var(--success-500)" : "var(--error-500)";

  return (
    <div
      className={`kpi-card ${refreshing ? "refreshing" : ""} ${warning ? "warning" : ""} ${className}`}
    >
      <div className="top-row">
        <div className="label-block">
          <div className="leading-none">{labelTop}</div>
          {labelBottom && <div className="leading-none">{labelBottom}</div>}
        </div>
        <div className="metric">
          <span className="metric-value" data-unit={unit}>
            {displayValue}
          </span>
        </div>
      </div>
      <Sparkline
        data={sparkData}
        onRendered={handleRendered}
        className="sparkline"
        color={sparkColor}
        strokeWidth={5}
      />
    </div>
  );

  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
}
