import { useCallback, type KeyboardEvent } from 'react';
import { useRefFrom } from 'use-ref-from';
import { hooks } from 'botframework-webchat-component';

const { useScrollDown, useScrollUp } = hooks;

export default function useTranscriptNavigation(message: string) {
  const messageRef = useRefFrom(message);
  const scrollDown = useScrollDown();
  const scrollUp = useScrollUp();

  return useCallback(
    (event: KeyboardEvent<unknown>) => {
      if (messageRef.current.length) {
        return;
      }

      const { ctrlKey, metaKey, shiftKey } = event;

      if (ctrlKey || metaKey || shiftKey) {
        return;
      }

      let handled = true;

      switch (event.key) {
        case 'End':
          scrollDown({ displacement: Infinity });
          break;

        case 'Home':
          scrollUp({ displacement: Infinity });
          break;

        case 'PageDown':
          scrollDown();
          break;

        case 'PageUp':
          scrollUp();
          break;

        default:
          handled = false;
          break;
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    [messageRef, scrollDown, scrollUp]
  );
}
