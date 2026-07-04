import { cn } from "@/lib/utils";
import styles from "./Badge.module.css";

type Tone = "blush" | "sky" | "butter" | "ink";

export function Badge({
  tone = "ink",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn(styles.badge, styles[tone], className)}>{children}</span>;
}
