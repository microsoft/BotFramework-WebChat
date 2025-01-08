import { useCallback } from 'react';
import { useScrollRelativeTranscript } from './transcriptScrollRelative';

export default function useScrollUp(): (options?: { displacement: number }) => void {
  const scrollRelative = useScrollRelativeTranscript();

  return useCallback(options => scrollRelative({ direction: 'up', ...options }), [scrollRelative]);
}
