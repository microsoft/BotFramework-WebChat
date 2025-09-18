import { hooks } from 'botframework-webchat';
import { useCallback, type KeyboardEvent } from 'react';

const { useScrollDown, useScrollUp } = hooks;

export default function useTranscriptNavigation() {
  const scrollDown = useScrollDown();
  const scrollUp = useScrollUp();

  return useCallback(
    (event: KeyboardEvent<unknown>) => {
      if (event.target instanceof HTMLTextAreaElement && event.target.value) {
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
    [scrollDown, scrollUp]
  );
}
