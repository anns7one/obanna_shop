"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fades a whole section up into place the first time it scrolls into view.
 * `once: true` means it never re-triggers on repeat scroll-past — a visitor
 * shouldn't see the same reveal twice.
 */
export function RevealSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
