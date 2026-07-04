"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./SortSelect.module.css";

interface SortSelectProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/**
 * Native <select> popups are rendered by the OS, not the browser's CSS
 * engine — Chrome/Windows in particular ignores styling on the option
 * list entirely. This rebuilds the same control as a plain button + menu
 * so the open state can actually match the rest of the UI.
 */
export function SortSelect<T extends string>({ value, options, onChange }: SortSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div ref={containerRef} className={styles.container}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={styles.btn}
      >
        <ArrowUpDown size={16} className={styles.icon} aria-hidden />
        <span className={styles.label}>{current.label}</span>
        <ChevronDown size={16} className={cn(styles.chevron, open && styles.open)} aria-hidden />
      </button>

      {open && (
        <ul role="listbox" className={styles.menu}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(styles.option, option.value === value && styles.selected)}
              >
                {option.label}
                {option.value === value && <Check size={16} className={styles.check} aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
