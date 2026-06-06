'use client';
import { useSyncExternalStore } from 'react';

const mediaQuery = '(prefers-reduced-motion: reduce)';

export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const query = window.matchMedia(mediaQuery);
      query.addEventListener('change', onStoreChange);
      return () => query.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(mediaQuery).matches,
    () => false,
  );
}
