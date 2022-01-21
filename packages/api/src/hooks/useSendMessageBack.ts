import { useCallback } from 'react';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendMessageBack(): (value: any, text?: string, displayText?: string) => void {
  const { sendMessageBack } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  return useCallback(
    (value: any, text?: string, displayText?: string) => {
      markAllAsAcknowledged();
      sendMessageBack(value, text, displayText);
    },
    [markAllAsAcknowledged, sendMessageBack]
  );
}
