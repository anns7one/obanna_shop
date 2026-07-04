import { Minus, Plus } from "lucide-react";
import styles from "./QuantityStepper.module.css";

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
    <div className={styles.stepper}>
      <button
        type="button"
        aria-label={`Decrease quantity of ${label}`}
        className={styles.btn}
        onClick={() => onChange(quantity - 1)}
        disabled={quantity <= 1}
      >
        <Minus size={16} aria-hidden />
      </button>
      <span className={styles.value} aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label={`Increase quantity of ${label}`}
        className={styles.btn}
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= max}
      >
        <Plus size={16} aria-hidden />
      </button>
    </div>
  );
}
