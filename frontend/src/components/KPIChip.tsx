interface Props { label: string; value: string | number; }

export default function KPIChip({ label, value }: Props) {
  return (
    <div className="bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] rounded-lg p-4 text-center">
      <div className="text-xs font-medium leading-[1.4] text-[var(--color-neutral-500)]">{label}</div>
      <div className="text-xl font-semibold leading-[1.2] text-[var(--color-neutral-900)]">{value}</div>
    </div>
  );
}
