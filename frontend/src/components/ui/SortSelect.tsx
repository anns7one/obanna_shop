"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const menuId = useId();

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
    <div ref={containerRef} className="sort-select">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        className="sort-select-btn"
      >
        <ArrowUpDown size={16} className="sort-select-icon" aria-hidden />
        <span className="sort-select-label">{current.label}</span>
        <ChevronDown size={16} className={cn("sort-select-chevron", open && "sort-select-chevron-open")} aria-hidden />
      </button>

      {open && (
        <ul id={menuId} role="listbox" className="sort-select-menu">
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
                className={cn("sort-select-option", option.value === value && "sort-select-option-selected")}
              >
                {option.label}
                {option.value === value && <Check size={16} className="sort-select-check" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
