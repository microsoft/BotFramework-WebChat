import { useCallback } from 'react';

import useTrackEvent from './useTrackEvent';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSubmitSendBox() {
  const { submitSendBox } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    (...args) => {
      // We cannot use spread operator as it broken in Angular.
      const method = args[0] || 'keyboard';

      trackEvent('submitSendBox', method);

      return submitSendBox(...args);
    },
    [submitSendBox, trackEvent]
  );
}
