import { useCallback } from 'react';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function useEmitTypingIndicator(): () => void {
  const { emitTypingIndicator } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  return useCallback(() => {
    markAllAsAcknowledged();
    emitTypingIndicator();
  }, [emitTypingIndicator, markAllAsAcknowledged]);
}
