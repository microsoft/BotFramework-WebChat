import { useCallback } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import useMarkActivity from './internal/useMarkActivity';

export default function useMarkActivityAsSpoken(): (activity: WebChatActivity) => void {
  const markActivity = useMarkActivity();

  return useCallback(activity => markActivity(activity, 'speak', false), [markActivity]);
}
