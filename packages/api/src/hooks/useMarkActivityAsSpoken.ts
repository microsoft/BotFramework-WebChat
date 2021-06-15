import { DirectLineActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';

import useMarkActivity from './internal/useMarkActivity';

export default function useMarkActivityAsSpoken(): (activity: DirectLineActivity) => void {
  const markActivity = useMarkActivity();

  return useCallback(activity => markActivity(activity, 'speak', false), [markActivity]);
}
