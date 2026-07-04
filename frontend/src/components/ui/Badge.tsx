import { cn } from "@/lib/utils";

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
  return <span className={cn("badge", `badge-${tone}`, className)}>{children}</span>;
}
