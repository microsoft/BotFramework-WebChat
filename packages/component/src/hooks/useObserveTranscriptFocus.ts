import { useEffect } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useObserveTranscriptFocus(
  observer: ((event: { activity: WebChatActivity }) => void) | undefined,
  deps: any[]
): void {
  if (typeof observer !== 'function') {
    // Shortcut for disabling the observer.
    // eslint-disable-next-line react-hooks/immutability
    observer = undefined;

    console.warn('botframework-webchat: First argument passed to "useObserveTranscriptFocus" must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to "useObserveTranscriptFocus" must be an array if specified.'
    );
  }

  const { observeTranscriptFocus } = useWebChatUIContext();

  useEffect(
    () => observer && observeTranscriptFocus(observer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...(deps || []), observer, observeTranscriptFocus]
  );
}
