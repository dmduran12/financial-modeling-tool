import Sparkline from './Sparkline';

interface Props {
  label: string;
  value: string | number;
  sparkData: number[];
}

export default function KPIChip({ label, value, sparkData }: Props) {
  return (
    <div className="bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-lg p-4 flex items-center">
      <div className="w-1/3 text-left">
        <div className="text-base font-medium leading-[1.4] text-[var(--color-neutral-500)]">{label}</div>
        <div className="text-3xl font-semibold leading-[1.2] text-[var(--color-neutral-900)]">{value}</div>
      </div>
      <div className="w-2/3 h-10">
        <Sparkline data={sparkData} />
      </div>
    </div>
  );
}
