import { useEffect, useRef, useState } from 'react';
import Sparkline from './Sparkline';
import { formatNumberShort, formatCurrency } from '../utils/format';

interface Props {
  labelTop: string;
  labelBottom?: string;
  value: number | string;
  dataArray: number[];
  unit?: 'currency' | 'percent';
}

export default function KPIChip({ labelTop, labelBottom, value, dataArray, unit }: Props) {
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
    typeof value === 'number'
      ? unit === 'currency'
        ? formatCurrency(value)
        : formatNumberShort(value)
      : value;

  const sparkData = [...dataArray].reverse();

  return (
    <div
      className={`kpi-card ${refreshing ? 'refreshing' : ''}`}
    >
      <div className="label-block">
        <div className="leading-none">{labelTop}</div>
        {labelBottom && <div className="leading-none">{labelBottom}</div>}
      </div>
      <div className="metric mt-1">
        <span className="metric-value" data-unit={unit}>{displayValue}</span>
      </div>
      <Sparkline
        data={sparkData}
        onRendered={handleRendered}
        className="sparkline left-[4px] right-[4px]"
      />
    </div>
  );

  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
}
