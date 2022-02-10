import { useCallback } from 'react';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useFocus(): (where?: 'main' | 'sendBox' | 'sendBoxWithoutKeyboard') => void {
  const { focusSendBoxCallbacksRef, focusTranscriptCallbacksRef } = useWebChatUIContext();

  return useCallback(
    where => {
      if (where === 'sendBoxWithoutKeyboard') {
        return focusSendBoxCallbacksRef.current.forEach(callback => callback({ noKeyboard: true }));
      }

      const { current } = where === 'sendBox' ? focusSendBoxCallbacksRef : focusTranscriptCallbacksRef;

      current.forEach(callback => callback());
    },
    [focusSendBoxCallbacksRef, focusTranscriptCallbacksRef]
  );
}
