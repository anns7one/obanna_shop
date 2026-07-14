"use client";

import { motion } from "framer-motion";

/**
 * Splits text into words and animates each one in (blur + fade + rise) as
 * it scrolls into view, staggered left to right. Purely decorative —
 * screen readers get the plain text via aria-label on the wrapper, with the
 * animated words hidden from the accessibility tree.
 */
export function BlurText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text}>
      <span
        aria-hidden="true"
        style={{ display: "flex", flexWrap: "wrap", rowGap: "0.1em" }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: delay + i * 0.06 }}
            style={{ display: "inline-block", marginRight: "0.28em" }}
          >
            {word}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
