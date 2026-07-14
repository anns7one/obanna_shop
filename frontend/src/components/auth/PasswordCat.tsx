import { cn } from "@/lib/utils";

interface PasswordCatProps {
  active: boolean;
  label?: string;
  className?: string;
}

export function PasswordCat({ active, label, className }: PasswordCatProps) {
  return (
    <div className={cn("password-cat", className)}>
      {label && <span className="password-cat-label">{label}</span>}
      <div className="password-cat-icon" aria-hidden="true">
        <svg viewBox="0 0 120 96" className="password-cat-svg">
          <path d="M22 28 L10 2 L40 20 Z" className="password-cat-ear" />
          <path d="M98 28 L110 2 L80 20 Z" className="password-cat-ear" />
          <path d="M25 23 L19 9 L36 19 Z" className="password-cat-ear-inner" />
          <path d="M95 23 L101 9 L84 19 Z" className="password-cat-ear-inner" />

          <ellipse cx="60" cy="52" rx="44" ry="38" className="password-cat-head" />

          <circle cx="26" cy="62" r="7" className="password-cat-cheek" />
          <circle cx="94" cy="62" r="7" className="password-cat-cheek" />

          <path d="M14 50 H32 M14 58 H31" className="password-cat-whisker" />
          <path d="M106 50 H88 M106 58 H89" className="password-cat-whisker" />

          <circle cx="42" cy="48" r="5" className="password-cat-eye" />
          <circle cx="78" cy="48" r="5" className="password-cat-eye" />

          <path d="M56 58 L64 58 L60 63 Z" className="password-cat-nose" />
          <path d="M60 63 Q53 71 46 65 M60 63 Q67 71 74 65" className="password-cat-mouth" />

          <g className={cn("password-cat-paw", "password-cat-paw-left", active && "is-active")}>
            <ellipse cx="42" cy="48" rx="13" ry="15" />
            <circle cx="36" cy="40" r="3" />
            <circle cx="44" cy="37" r="3" />
            <circle cx="50" cy="40" r="3" />
          </g>
          <g className={cn("password-cat-paw", "password-cat-paw-right", active && "is-active")}>
            <ellipse cx="78" cy="48" rx="13" ry="15" />
            <circle cx="70" cy="40" r="3" />
            <circle cx="76" cy="37" r="3" />
            <circle cx="84" cy="40" r="3" />
          </g>
        </svg>
      </div>
    </div>
  );
}
