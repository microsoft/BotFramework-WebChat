import { useCallback } from 'react';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useSendPostBack(): (value?: any) => void {
  const { sendPostBack } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  return useCallback(
    (value?: any) => {
      markAllAsAcknowledged();
      sendPostBack(value);
    },
    [markAllAsAcknowledged, sendPostBack]
  );
}
