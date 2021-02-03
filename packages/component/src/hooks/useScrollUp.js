import { useCallback } from 'react';

import useScrollRelative from './internal/useScrollRelative';

export default function useScrollUp() {
  const scrollRelative = useScrollRelative();

  return useCallback(() => scrollRelative('up'), [scrollRelative]);
}
