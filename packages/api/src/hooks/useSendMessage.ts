import { useCallback } from 'react';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendMessage(): (
  text: string,
  method?: string,
  { channelData }?: { channelData?: any }
) => void {
  const { sendMessage } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  return useCallback(
    (text: string, method?: string, { channelData }: { channelData?: any } = {}) => {
      markAllAsAcknowledged();
      sendMessage(text, method, { channelData });
    },
    [markAllAsAcknowledged, sendMessage]
  );
}
