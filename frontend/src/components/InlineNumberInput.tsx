import { useRef, useState } from 'react';
import { formatCurrency, formatNumberShort } from '../utils/format';

interface Props {
  label: string;
  value: number;
  unit?: '$' | '%';
  onChange: (value: number) => void;
}

export default function InlineNumberInput({ label, value, unit, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const display = unit === '$' ? formatCurrency(value) :
                  unit === '%' ? `${value}%` : formatNumberShort(value);

  const handleFocus = () => {
    setEditing(true);
    setTemp(value);
  };

  const handleBlur = () => {
    setEditing(false);
    if (!isNaN(temp)) {
      onChange(temp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`chip ${editing ? 'editing' : ''}`}>\
      <span className="label">{label}</span>
      <span className="value" data-unit={unit}>{display}</span>
      <input
        ref={inputRef}
        type="number"
        value={temp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setTemp(parseFloat(e.target.value))}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
