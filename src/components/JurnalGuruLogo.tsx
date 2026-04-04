/**
 * JurnalGuruLogo — Adaptive isometric book logo
 * Light mode  → dark slate / black fills
 * Dark mode   → light silver / white fills
 *
 * Reads isDark prop from parent (which checks Tailwind dark class on <html>)
 * so it always stays in sync with the app's theme toggle.
 */

import { useEffect, useState } from 'react';

interface JurnalGuruLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

function useIsDark() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    obs.observe(document.documentElement, { attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

export function JurnalGuruLogo({ size = 120, showText = true, className = '' }: JurnalGuruLogoProps) {
  const dark = useIsDark();

  const fill      = dark ? '#e2e2e2' : '#1a1a1a';
  const fillMid   = dark ? '#b8b8b8' : '#3a3a3a';
  const stripe    = dark ? '#1a1a1a' : '#ffffff';

  const width  = size;
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
    >
      {/* Top face */}
      <polygon points="100,20 185,62 100,104 15,62" fill={fillMid} />
      {/* Left face */}
      <polygon points="15,62 15,130 100,172 100,104" fill={fill} />
      {/* Right face */}
      <polygon points="100,104 185,62 185,130 100,172" fill={fillMid} />
      {/* Page stripes */}
      <line x1="107" y1="112" x2="178" y2="75"  stroke={stripe} strokeWidth="5" strokeLinecap="round" />
      <line x1="107" y1="126" x2="178" y2="89"  stroke={stripe} strokeWidth="5" strokeLinecap="round" />
      <line x1="107" y1="140" x2="178" y2="103" stroke={stripe} strokeWidth="5" strokeLinecap="round" />

      {showText && (
        <>
          <text x="100" y="210" textAnchor="middle"
            fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontWeight="700" fontSize="34" letterSpacing="3" fill={fill}>
            JURNAL GURU
          </text>
          <text x="100" y="247" textAnchor="middle"
            fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontWeight="400" fontSize="15" letterSpacing="4" fill={fill} opacity="0.65">
            ADMINISTRASI MODERN
          </text>
        </>
      )}
    </svg>
  );
}
