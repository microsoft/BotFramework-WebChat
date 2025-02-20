import { useCallback } from 'react';
import { useScrollRelativeTranscript } from './transcriptScrollRelative';

export default function useScrollDown(): (options?: { displacement: number }) => void {
  const scrollRelative = useScrollRelativeTranscript();

  return useCallback(options => scrollRelative({ direction: 'down', ...options }), [scrollRelative]);
}
