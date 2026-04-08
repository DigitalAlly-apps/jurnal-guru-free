/**
 * Single source of truth untuk dark mode.
 * Dipakai oleh AppHeader dan SetelanPage — tidak ada duplikasi state.
 */
import { useState, useCallback, useEffect } from 'react';

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
  } catch { /* */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(getInitial);

  // Apply on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggle = useCallback((next?: boolean) => {
    setIsDark(prev => {
      const value = next !== undefined ? next : !prev;
      document.documentElement.classList.toggle('dark', value);
      try { localStorage.setItem('theme', value ? 'dark' : 'light'); } catch { /* */ }
      // Dispatch custom event so other components sync
      window.dispatchEvent(new CustomEvent('darkmode-change', { detail: value }));
      return value;
    });
  }, []);

  // Listen for changes from other components
  useEffect(() => {
    const handler = (e: Event) => {
      setIsDark((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('darkmode-change', handler);
    return () => window.removeEventListener('darkmode-change', handler);
  }, []);

  return { isDark, toggle };
}
