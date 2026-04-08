import { useEffect, useState } from 'react';

interface JurnalGuruLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

// The actual brand logo as inline SVG — safe zone padded so it's never clipped
export function JurnalGuruLogo({ size = 120, showText = true, className = '' }: JurnalGuruLogoProps) {
  const dim = showText ? size : Math.round(size * 0.9);

  return (
    <div
      className={className}
      style={{
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* 
        Using <img> with the SVG avoids React JSX issues with complex SVG paths.
        The SVG already has its own background (#0cc0df) baked in.
        We wrap in a rounded container to match phone icon shapes.
      */}
      <img
        src="/icon.svg"
        alt="Jurnal Guru Pro"
        width={dim}
        height={dim}
        style={{
          borderRadius: Math.round(dim * 0.22),   /* ~22% = matches Android adaptive icon */
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </div>
  );
}

// Standalone icon only (no text, rounded) — for sidebar collapsed state
export function JurnalGuruIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/icon.svg"
      alt="Jurnal Guru"
      width={size}
      height={size}
      className={className}
      style={{
        borderRadius: Math.round(size * 0.22),
        display: 'block',
        flexShrink: 0,
        objectFit: 'contain',
      }}
    />
  );
}
