import { useRef, useState } from 'react';
import { formatCurrency, formatNumberShort } from '../utils/format';

interface Props {
  label: string;
  value: number;
  unit?: 'currency' | 'percent';
  onChange: (value: number) => void;
  name?: string;
  id?: string;
}

export default function InlineNumberInput({ label, value, unit, onChange, name, id }: Props) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState<number>(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const safeName = (name || label).replace(/\s+/g, '_').toLowerCase();
  const inputId = id || safeName;

  const display = unit === 'currency' ? formatCurrency(value) :
                  unit === 'percent' ? value.toString() : formatNumberShort(value);

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
        id={inputId}
        name={safeName}
        value={temp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => setTemp(parseFloat(e.target.value))}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
