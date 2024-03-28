import { useCallback } from 'react';

import createWaitUntilable from './internal/createWaitUntilable';
import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useFocus(): (where?: 'main' | 'sendBox' | 'sendBoxWithoutKeyboard') => Promise<void> {
  const { focusSendBoxCallbacksRef, focusTranscriptCallbacksRef } = useWebChatUIContext();

  return useCallback(
    async where => {
      if (where === 'sendBox' || where === 'sendBoxWithoutKeyboard') {
        const [options, getPromise] = createWaitUntilable({ noKeyboard: where === 'sendBoxWithoutKeyboard' });

        focusSendBoxCallbacksRef.current.forEach(callback => callback(options));

        await getPromise();
      } else {
        const [, getPromise] = createWaitUntilable({});

        focusTranscriptCallbacksRef.current.forEach(callback => callback());

        await getPromise();
      }
    },
    [focusSendBoxCallbacksRef, focusTranscriptCallbacksRef]
  );
}
