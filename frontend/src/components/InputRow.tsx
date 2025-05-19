interface Props {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputRow({ label, name, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 items-center">
      <label htmlFor={name} className="text-xs font-medium text-left">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        className="text-right font-mono border border-[var(--color-neutral-200)] rounded px-2 py-1"
      />
    </div>
  );
}
