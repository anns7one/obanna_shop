import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Field.module.css";

interface FieldWrapperProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

function FieldWrapper({
  label,
  id,
  error,
  hint,
  required,
  children,
}: FieldWrapperProps & { children: React.ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = FieldWrapperProps & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, error, hint, required, id, className, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} id={id} error={error} hint={hint} required={required}>
      <input
        id={id}
        className={cn(styles.input, error && styles.invalid, className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </FieldWrapper>
  );
}

type TextareaProps = FieldWrapperProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, hint, required, id, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} id={id} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        className={cn(styles.input, styles.textarea, error && styles.invalid, className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </FieldWrapper>
  );
}

type SelectProps = FieldWrapperProps &
  SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode };

export function Select({ label, error, hint, required, id, className, children, ...props }: SelectProps) {
  return (
    <FieldWrapper label={label} id={id} error={error} hint={hint} required={required}>
      <select
        id={id}
        className={cn(styles.input, styles.select, error && styles.invalid, className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
