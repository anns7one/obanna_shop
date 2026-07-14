"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface Blob {
  tone: "blush" | "sky" | "butter";
  variant?: "alt";
  depth: number;
  style: CSSProperties;
}

const BLOBS: Blob[] = [
  { tone: "blush", depth: 0.02, style: { top: "-8%", left: "2%", width: "26rem", height: "26rem" } },
  { tone: "sky", depth: 0.035, style: { top: "6%", right: "-6%", width: "22rem", height: "22rem" } },
  { tone: "butter", depth: 0.015, style: { bottom: "-14%", left: "32%", width: "24rem", height: "24rem" } },
  { tone: "sky", variant: "alt", depth: 0.025, style: { top: "42%", left: "-10%", width: "18rem", height: "18rem" } },
  { tone: "blush", variant: "alt", depth: 0.03, style: { bottom: "2%", right: "-8%", width: "20rem", height: "20rem" } },
];

interface Particle {
  tone: "blush" | "sky" | "butter";
  depth: number;
  size: number;
  top: string;
  left: string;
  duration: number;
}

const PARTICLES: Particle[] = [
  { tone: "blush", depth: 0.06, size: 7, top: "20%", left: "14%", duration: 7 },
  { tone: "sky", depth: 0.09, size: 5, top: "62%", left: "22%", duration: 9 },
  { tone: "butter", depth: 0.05, size: 6, top: "28%", left: "76%", duration: 8 },
  { tone: "blush", depth: 0.08, size: 4, top: "72%", left: "84%", duration: 10 },
  { tone: "sky", depth: 0.07, size: 5, top: "48%", left: "48%", duration: 6.5 },
  { tone: "butter", depth: 0.04, size: 6, top: "12%", left: "44%", duration: 11 },
];

/**
 * Decorative only (aria-hidden). Mouse parallax is skipped for touch
 * devices and for prefers-reduced-motion, and is applied via a CSS custom
 * property + rAF-throttled listener rather than React state so mouse moves
 * never trigger a re-render.
 */
export function HeroBackground() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return;

    let targetX = 0;
    let targetY = 0;
    let frame: number | null = null;

    function apply() {
      frame = null;
      root!.style.setProperty("--parallax-x", `${targetX}`);
      root!.style.setProperty("--parallax-y", `${targetY}`);
    }

    function handleMove(e: MouseEvent) {
      const rect = root!.getBoundingClientRect();
      targetX = e.clientX - (rect.left + rect.width / 2);
      targetY = e.clientY - (rect.top + rect.height / 2);
      if (frame === null) frame = requestAnimationFrame(apply);
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-bg" aria-hidden="true">
      <div className="hero-bg-aurora" />
      <div className="hero-bg-breath" />

      {BLOBS.map((blob, i) => (
        <span
          key={i}
          className="hero-bg-blob-wrap"
          style={{ ...blob.style, "--depth": blob.depth } as CSSProperties}
        >
          <span
            className={`hero-bg-blob hero-bg-blob-${blob.tone}${blob.variant ? `-${blob.variant}` : ""}`}
          />
        </span>
      ))}

      <div className="hero-bg-particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="hero-bg-particle-wrap"
            style={{ top: p.top, left: p.left, "--depth": p.depth } as CSSProperties}
          >
            <span
              className={`hero-bg-particle hero-bg-particle-${p.tone}`}
              style={{ width: p.size, height: p.size, animationDuration: `${p.duration}s` }}
            />
          </span>
        ))}
      </div>

      <svg className="hero-bg-grain">
        <filter id="hero-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain-filter)" />
      </svg>
    </div>
  );
}
