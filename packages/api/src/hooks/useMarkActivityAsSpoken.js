import { useCallback } from 'react';

import useMarkActivity from './internal/useMarkActivity';

export default function useMarkActivityAsSpoken() {
  const markActivity = useMarkActivity();

  return useCallback(activity => markActivity(activity, 'speak', false), [markActivity]);
}
