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

  const fill    = dark ? '#e2e2e2' : '#1a1a1a';
  const fillMid = dark ? '#b8b8b8' : '#3a3a3a';
  const stripe  = dark ? '#1a1a1a' : '#ffffff';

  const width  = size;
  const height = showText ? Math.round(size * 1.65) : Math.round(size * 0.95);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={showText ? '-10 0 220 330' : '-10 0 220 175'}
      width={width}
      height={height}
      className={className}
      aria-label="Jurnal Guru - Administrasi Modern"
      role="img"
    >
      {/* Top face */}
      <polygon points="100,18 186,61 100,104 14,61" fill={fillMid} />
      {/* Left face */}
      <polygon points="14,61 14,132 100,175 100,104" fill={fill} />
      {/* Right face */}
      <polygon points="100,104 186,61 186,132 100,175" fill={fillMid} />
      {/* Page stripes */}
      <line x1="108" y1="113" x2="179" y2="76"  stroke={stripe} strokeWidth="5.5" strokeLinecap="round" />
      <line x1="108" y1="127" x2="179" y2="90"  stroke={stripe} strokeWidth="5.5" strokeLinecap="round" />
      <line x1="108" y1="141" x2="179" y2="104" stroke={stripe} strokeWidth="5.5" strokeLinecap="round" />

      {showText && (
        <>
          <text x="100" y="215" textAnchor="middle"
            fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontWeight="700" fontSize="33" letterSpacing="2.5" fill={fill}>
            JURNAL GURU
          </text>
          <text x="100" y="250" textAnchor="middle"
            fontFamily="'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif"
            fontWeight="400" fontSize="13.5" letterSpacing="3.5" fill={fill} opacity="0.65">
            ADMINISTRASI MODERN
          </text>
        </>
      )}
    </svg>
  );
}
