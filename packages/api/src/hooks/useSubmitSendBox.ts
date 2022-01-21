import { useCallback } from 'react';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useTrackEvent from './useTrackEvent';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSubmitSendBox(): (method?: string, { channelData }?: { channelData: any }) => void {
  const { submitSendBox } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();
  const trackEvent = useTrackEvent();

  return useCallback(
    (method: string, { channelData }: { channelData?: any } = {}) => {
      markAllAsAcknowledged();

      trackEvent('submitSendBox', method);

      return submitSendBox(method, channelData && { channelData });
    },
    [markAllAsAcknowledged, submitSendBox, trackEvent]
  );
}
