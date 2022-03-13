import { useCallback } from 'react';
import type { DirectLineActivity } from 'botframework-webchat-core';

import useMarkActivity from './internal/useMarkActivity';

export default function useMarkActivityAsSpoken(): (activity: DirectLineActivity) => void {
  const markActivity = useMarkActivity();

  return useCallback(activity => markActivity(activity, 'speak', false), [markActivity]);
}
