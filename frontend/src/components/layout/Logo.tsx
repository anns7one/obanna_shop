interface LogoProps {
  /** "monogram" — just the OBA mark, for tight spaces (mobile header,
   * avatars). "wordmark" — OBA + swash, for the header. "full" — the whole
   * lockup with ATELIER / BALI · PARIS, for the footer and hero contexts. */
  variant?: "monogram" | "wordmark" | "full";
  className?: string;
}

/**
 * The OBA lettermark is set in Playfair Display (already the site's display
 * font) rather than hand-drawn, so the letterforms themselves come from a
 * real typeface — only the connecting swash below them is a custom path.
 */
export function Logo({ variant = "wordmark", className }: LogoProps) {
  if (variant === "monogram") {
    return (
      <svg
        viewBox="0 0 96 96"
        className={className}
        role="img"
        aria-label="OBA Atelier"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="1.5" />
        <text
          x="48"
          y="61"
          textAnchor="middle"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="700"
          fontSize="34"
          letterSpacing="-1.5"
          fill="currentColor"
        >
          OBA
        </text>
      </svg>
    );
  }

  if (variant === "full") {
    // ATELIER / BALI · PARIS are plain HTML text, not SVG <text> — at the
    // small sizes a footer logo needs, SVG text scaled down via a viewBox
    // can pick up color-fringed antialiasing on some displays; ordinary
    // HTML text doesn't have that problem and still uses the same font.
    return (
      <div className={className} role="img" aria-label="OBA Atelier — Bali · Paris">
        <svg viewBox="0 0 320 100" width="100%" height="auto" style={{ display: "block" }} fill="none" xmlns="http://www.w3.org/2000/svg">
          <text
            x="160"
            y="72"
            textAnchor="middle"
            fontFamily="'Playfair Display', Georgia, serif"
            fontWeight="700"
            fontSize="72"
            letterSpacing="-2.5"
            fill="currentColor"
          >
            OBA
          </text>
          <path
            d="M46 78 C 85 92, 120 98, 160 94 C 190 91, 215 80, 240 62 C 262 46, 282 28, 308 10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <p className="logo-full-atelier">ATELIER</p>
        <p className="logo-full-tagline">BALI · PARIS</p>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 216 84"
      className={className}
      role="img"
      aria-label="OBA Atelier"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="4"
        y="54"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-2"
        fill="currentColor"
      >
        OBA
      </text>
      <path
        d="M6 58 C 30 74, 55 82, 85 80 C 105 78, 120 68, 140 55 C 160 40, 175 25, 200 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
