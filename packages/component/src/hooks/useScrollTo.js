import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useScrollTo() {
  const { scrollToCallbacksRef } = useWebChatUIContext();

  return useCallback((...args) => scrollToCallbacksRef.current.forEach(callback => callback(...args)), [
    scrollToCallbacksRef
  ]);
}
