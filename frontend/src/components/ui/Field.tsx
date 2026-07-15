import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

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
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="field-required"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

type InputProps = FieldWrapperProps &
  InputHTMLAttributes<HTMLInputElement> & {
    /** Rendered inside the input's own row, absolutely positioned at the
     * trailing edge — e.g. a show/hide-password toggle. Only affects this
     * one field's layout, not the label or hint/error text below it. */
    endAdornment?: React.ReactNode;
  };

export function Input({ label, error, hint, required, id, className, endAdornment, ...props }: InputProps) {
  return (
    <FieldWrapper label={label} id={id} error={error} hint={hint} required={required}>
      <div className="field-input-row">
        <input
          id={id}
          className={cn("field-input", endAdornment && "field-input-with-adornment", error && "field-input-invalid", className)}
          aria-invalid={Boolean(error)}
          required={required}
          {...props}
        />
        {endAdornment}
      </div>
    </FieldWrapper>
  );
}

type TextareaProps = FieldWrapperProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, error, hint, required, id, className, ...props }: TextareaProps) {
  return (
    <FieldWrapper label={label} id={id} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        className={cn("field-input", "field-textarea", error && "field-input-invalid", className)}
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
        className={cn("field-input", "field-select", error && "field-input-invalid", className)}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
