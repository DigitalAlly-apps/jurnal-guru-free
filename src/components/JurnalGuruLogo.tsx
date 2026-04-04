/**
 * JurnalGuruLogo — Adaptive isometric book logo
 * Light mode  → dark slate / black fills
 * Dark mode   → light silver / white fills
 *
 * Uses currentColor via CSS custom properties so the fill
 * responds to both Tailwind `dark:` class and
 * `@media (prefers-color-scheme: dark)` automatically.
 */

interface JurnalGuruLogoProps {
  /** Width of the SVG (height scales proportionally) */
  size?: number;
  /** Show text labels below the book icon */
  showText?: boolean;
  className?: string;
}

export function JurnalGuruLogo({
  size = 120,
  showText = true,
  className = '',
}: JurnalGuruLogoProps) {
  // Aspect ratio of the full composition (icon + text): 1 : 1.55
  const width = size;
  const height = showText ? Math.round(size * 1.55) : Math.round(size * 0.85);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showText ? '0 0 200 310' : '0 0 200 170'}
      width={width}
      height={height}
      className={className}
      aria-label="Jurnal Guru - Administrasi Modern"
      role="img"
      style={
        {
          '--logo-fill': '#1a1a1a',
          '--logo-fill-mid': '#2d2d2d',
          '--logo-stripe': '#ffffff',
        } as React.CSSProperties
      }
    >
      <style>{`
        @media (prefers-color-scheme: dark) {
          .logo-root {
            --logo-fill: #e8e8e8;
            --logo-fill-mid: #c8c8c8;
            --logo-stripe: #1a1a1a;
          }
        }
        :root.dark .logo-root {
          --logo-fill: #e8e8e8;
          --logo-fill-mid: #c8c8c8;
          --logo-stripe: #1a1a1a;
        }
      `}</style>

      {/* Wrapper group that carries the CSS vars */}
      <g className="logo-root">

        {/* ── Isometric book icon ── */}

        {/* Top face of book (lighter) */}
        <polygon
          points="100,20 185,62 100,104 15,62"
          fill="var(--logo-fill-mid)"
        />

        {/* Left face of book (darkest) */}
        <polygon
          points="15,62 15,130 100,172 100,104"
          fill="var(--logo-fill)"
        />

        {/* Right face (slightly lighter than left) */}
        <polygon
          points="100,104 185,62 185,130 100,172"
          fill="var(--logo-fill-mid)"
        />

        {/* Page stripes on right face — 3 white lines */}
        <line x1="107" y1="112" x2="178" y2="75"  stroke="var(--logo-stripe)" strokeWidth="5" strokeLinecap="round" />
        <line x1="107" y1="126" x2="178" y2="89"  stroke="var(--logo-stripe)" strokeWidth="5" strokeLinecap="round" />
        <line x1="107" y1="140" x2="178" y2="103" stroke="var(--logo-stripe)" strokeWidth="5" strokeLinecap="round" />

        {showText && (
          <>
            {/* JURNAL GURU */}
            <text
              x="100"
              y="210"
              textAnchor="middle"
              fontFamily="'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif"
              fontWeight="700"
              fontSize="34"
              letterSpacing="3"
              fill="var(--logo-fill)"
            >
              JURNAL GURU
            </text>

            {/* ADMINISTRASI MODERN */}
            <text
              x="100"
              y="245"
              textAnchor="middle"
              fontFamily="'Segoe UI', 'Inter', 'Helvetica Neue', Arial, sans-serif"
              fontWeight="400"
              fontSize="16"
              letterSpacing="4"
              fill="var(--logo-fill)"
              opacity="0.75"
            >
              ADMINISTRASI MODERN
            </text>
          </>
        )}
      </g>
    </svg>
  );
}