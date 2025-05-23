import { useRef, useState, ReactNode } from "react";
import { formatCurrency, formatNumberShort } from "../utils/format";

interface Props {
  label: ReactNode;
  value: number;
  unit?: "currency" | "percent";
  onChange: (value: number) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  tooltip?: string;
}

export default function InlineNumberInput({
  label,
  value,
  unit,
  onChange,
  name,
  id,
  disabled = false,
  tooltip,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState<number>(value);
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseLabel = typeof label === "string" ? label : "input";
  const safeName = (name || baseLabel).replace(/\s+/g, "_").toLowerCase();
  const inputId = id || safeName;

  const display =
    unit === "currency"
      ? formatCurrency(value)
      : unit === "percent"
        ? value.toString()
        : formatNumberShort(value);

  const handleFocus = () => {
    setEditing(true);
    setTemp(value);
  };

  const handleBlur = () => {
    setEditing(false);
    if (!isNaN(temp) && !invalid) {
      onChange(temp);
    } else {
      setTemp(value);
    }
    setInvalid(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      inputRef.current?.blur();
    }
  };

  return (
    <div
      className={`chip ${editing ? "editing" : ""} ${invalid ? "invalid" : ""} ${
        disabled ? "readonly" : ""
      }`}
      onClick={() => inputRef.current?.focus()}
      title={disabled ? tooltip : undefined}
    >
      <span className="label">{label}</span>
      <span className="value" data-unit={unit}>
        {display}
      </span>
      <input
        ref={inputRef}
        type="number"
        id={inputId}
        name={safeName}
        value={temp}
        step={unit === "percent" ? 0.5 : 1}
        onFocus={handleFocus}
        onBlur={handleBlur}
        readOnly={disabled}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setTemp(val);
          setInvalid(isNaN(val));
        }}
        onKeyDown={handleKeyDown}
        aria-label={baseLabel}
      />
    </div>
  );
}
