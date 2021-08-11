import { useCallback } from 'react';

import useWebChatUIContext from './useWebChatUIContext';

export default function useScrollRelative() {
  const { scrollRelativeCallbacksRef } = useWebChatUIContext();

  return useCallback(
    (...args) => scrollRelativeCallbacksRef.current.forEach(callback => callback(...args)),
    [scrollRelativeCallbacksRef]
  );
}
