import { useEffect } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import useWebChatUIContext from './internal/useWebChatUIContext';

export default function useObserveTranscriptFocus(
  observer: (event: { activity: WebChatActivity }) => void,
  deps: any[]
): void {
  if (typeof observer !== 'function') {
    observer = undefined;
    console.warn('botframework-webchat: First argument passed to "useObserveTranscriptFocus" must be a function.');
  } else if (typeof deps !== 'undefined' && !Array.isArray(deps)) {
    console.warn(
      'botframework-webchat: Second argument passed to "useObserveTranscriptFocus" must be an array if specified.'
    );
  }

  const { observeTranscriptFocus } = useWebChatUIContext();

  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(() => observer && observeTranscriptFocus(observer), [...(deps || []), observer, observeTranscriptFocus]);
}
