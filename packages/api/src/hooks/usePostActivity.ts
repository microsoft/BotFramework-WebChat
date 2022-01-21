import { DirectLineActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';
import Observable from 'core-js/features/observable';

import useMarkAllAsAcknowledged from './useMarkAllAsAcknowledged';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

export default function usePostActivity(): (activity: DirectLineActivity) => Observable<string> {
  const { postActivity } = useWebChatAPIContext();
  const markAllAsAcknowledged = useMarkAllAsAcknowledged();

  return useCallback(
    (activity: DirectLineActivity) => {
      markAllAsAcknowledged();

      return postActivity(activity);
    },
    [markAllAsAcknowledged, postActivity]
  );
}
