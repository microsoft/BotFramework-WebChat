import { useCallback } from 'react';

import useWebChatAPIContext from './internal/useWebChatAPIContext';
import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';

export default function useSendEvent(): (name: string, value: any) => void {
  const { sendEvent } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  return useCallback(
    (name: string, value: any) => {
      markAllAsAcknowledged();
      sendEvent(name, value);
    },
    [markAllAsAcknowledged, sendEvent]
  );
}
