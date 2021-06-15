import { useCallback } from 'react';

import useScrollRelative from './internal/useScrollRelative';

export default function useScrollUp(): (options?: { displacement: number }) => void {
  const scrollRelative = useScrollRelative();

  return useCallback((...args) => scrollRelative('up', ...args), [scrollRelative]);
}
