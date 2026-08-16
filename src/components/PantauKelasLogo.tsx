interface PantauKelasLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/** Logo Pantau Kelas untuk sidebar, onboarding, dan informasi aplikasi. */
export function PantauKelasLogo({ size = 120, showText = true, className = '' }: PantauKelasLogoProps) {
  const dim = Math.round(showText ? size : size * 0.9);
  return <img src="/icon-512.png" alt="Pantau Kelas" width={dim} height={dim} className={className} style={{ display: 'block', objectFit: 'contain' }} />;
}

export function PantauKelasIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <img src="/icon-192.png" alt="Pantau Kelas" width={size} height={size} className={className} style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }} />;
}
