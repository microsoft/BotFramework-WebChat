import { useCallback } from 'react';

import ScrollPosition from '../types/ScrollPosition';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useScrollTo(): (
  position: ScrollPosition,
  scrollToOptions: { behavior?: 'auto' | 'smooth' }
) => void {
  const { scrollToCallbacksRef } = useWebChatUIContext();

  return useCallback(
    (...args) => scrollToCallbacksRef.current.forEach(callback => callback(...args)),
    [scrollToCallbacksRef]
  );
}
