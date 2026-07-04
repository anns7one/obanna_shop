import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  quantity,
  max,
  onChange,
  label,
}: {
  quantity: number;
  max: number;
  onChange: (next: number) => void;
  label: string;
}) {
  return (
    <div className="stepper">
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        className="stepper-btn"
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
      >
        <Minus size={16} aria-hidden />
      </button>
      <span className="stepper-value" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        className="stepper-btn"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
      >
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}
