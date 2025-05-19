import { useEffect, useRef, useState } from 'react';
import Sparkline from './Sparkline';
import { formatNumberShort } from '../utils/format';

interface Props {
  labelTop: string;
  labelBottom?: string;
  value: number | string;
  dataArray: number[];
}

export default function KPIChip({ labelTop, labelBottom, value, dataArray }: Props) {
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
    typeof value === 'number' ? formatNumberShort(value) : value;

  return (
    <div
      className={`relative border border-[var(--neutral-200)] rounded-lg bg-[var(--neutral-50)] p-4 h-[80px] md:h-[100px] transition-opacity duration-500 ${
        refreshing ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="h-full md:grid md:grid-cols-5 flex flex-col" >
        <div className="md:col-span-2 flex flex-col text-left">
          <div className="font-sans font-medium text-[11px] md:text-[12px] text-[var(--neutral-400)] leading-none">
            {labelTop}
          </div>
          {labelBottom && (
            <div className="font-sans font-semibold text-[11px] md:text-[12px] text-[var(--neutral-600)] leading-none">
              {labelBottom}
            </div>
          )}
        </div>
        <div className="md:col-span-3 flex items-center md:justify-end justify-center font-sans font-bold text-[24px] md:text-[32px] text-[var(--neutral-900)] relative z-2">
          {displayValue}
        </div>
      </div>
      <Sparkline
        data={dataArray}
        onRendered={handleRendered}
        className="absolute left-[4px] right-[4px] bottom-0"
      />
    </div>
  );

  function arraysEqual(a: number[], b: number[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }
}
