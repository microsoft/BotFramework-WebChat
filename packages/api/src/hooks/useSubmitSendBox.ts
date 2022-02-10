import { useCallback } from 'react';

import useTrackEvent from './useTrackEvent';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSubmitSendBox(): (method?: string, { channelData }?: { channelData: any }) => void {
  const { submitSendBox } = useWebChatAPIContext();
  const trackEvent = useTrackEvent();

  return useCallback(
    (method: string, { channelData }: { channelData?: any } = {}) => {
      trackEvent('submitSendBox', method);

      return submitSendBox(method, channelData && { channelData });
    },
    [submitSendBox, trackEvent]
  );
}
