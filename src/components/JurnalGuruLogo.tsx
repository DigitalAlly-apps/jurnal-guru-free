interface JurnalGuruLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

/**
 * Logo resmi Jurnal Guru Pro.
 * Menggunakan PNG yang sudah di-render dengan rounded corners
 * agar konsisten di semua platform (Android, iOS, desktop).
 */
export function JurnalGuruLogo({ size = 120, showText = true, className = '' }: JurnalGuruLogoProps) {
  const dim = Math.round(showText ? size : size * 0.9);

  return (
    <img
      src="/icon-512.png"
      alt="Jurnal Guru Pro"
      width={dim}
      height={dim}
      className={className}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  );
}

/**
 * Versi kecil — untuk sidebar collapsed, header mobile, dsb.
 */
export function JurnalGuruIcon({ size = 32, className = '' }: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="/icon-192.png"
      alt="Jurnal Guru"
      width={size}
      height={size}
      className={className}
      style={{ display: 'block', objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
