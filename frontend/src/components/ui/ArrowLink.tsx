import Link from "next/link";
import { cn } from "@/lib/utils";

interface ArrowLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ArrowLink({ href, children, className }: ArrowLinkProps) {
  return (
    <Link href={href} className={cn("arrow-link", className)}>
      <span>{children}</span>
      <span className="arrow-link-arrow" aria-hidden="true">
        &rarr;
      </span>
    </Link>
  );
}
