import { cn } from "@/lib/utils";

const PALETTE = [
  "var(--color-blush-500)",
  "var(--color-sky-600)",
  "var(--color-butter-600)",
  "var(--color-blush-600)",
];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

interface AvatarProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** No photo upload — just the initials on a color derived from the name,
 * so every account gets a stable, distinct avatar with no storage or
 * upload surface to secure. */
export function Avatar({ firstName, lastName, size = "md", className }: AvatarProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <span
      className={cn("avatar", `avatar-${size}`, className)}
      style={{ background: colorForName(`${firstName} ${lastName}`) }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
