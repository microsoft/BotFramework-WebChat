import { useDispatch } from '@msinternal/botframework-webchat-redux-store';
import { postVoiceActivity, type WebChatActivity } from 'botframework-webchat-core';
import { useCallback } from 'react';

/**
 * Hook to post voice activities (fire-and-forget, no echo back).
 * Use this for DTMF and other voice-related event activities.
 */
export default function usePostVoiceActivity(): (activity: WebChatActivity) => void {
  const dispatch = useDispatch();

  return useCallback(
    (activity: WebChatActivity) => {
      dispatch(postVoiceActivity(activity));
    },
    [dispatch]
  );
}
