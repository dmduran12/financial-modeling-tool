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
  const displayValue =
    typeof value === "number"
      ? unit === "currency"
        ? "$" + formatCurrency(value)
        : unit === "percent"
          ? value.toFixed(2) + "%"
          : formatNumberShort(value)
      : value;

  return (
    <div className={`kpi-card ${warning ? "warning" : ""} ${className}`}>
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
    </div>
  );
}
