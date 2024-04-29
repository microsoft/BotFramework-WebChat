import { useCallback } from 'react';

import createWaitUntilable from './internal/createWaitUntilable';
import useWebChatUIContext from './internal/useWebChatUIContext';
import { useFocusSendBox } from './sendBoxFocus';

export default function useFocus(): (where?: 'main' | 'sendBox' | 'sendBoxWithoutKeyboard') => Promise<void> {
  const focusSendBox = useFocusSendBox();
  const { focusTranscriptCallbacksRef } = useWebChatUIContext();

  return useCallback(
    async where => {
      if (where === 'sendBox' || where === 'sendBoxWithoutKeyboard') {
        const [options, getPromise] = createWaitUntilable({ noKeyboard: where === 'sendBoxWithoutKeyboard' });

        focusSendBox(options);

        await getPromise();
      } else {
        const [, getPromise] = createWaitUntilable({});

        focusTranscriptCallbacksRef.current.forEach(callback => callback());

        await getPromise();
      }
    },
    [focusSendBox, focusTranscriptCallbacksRef]
  );
}
