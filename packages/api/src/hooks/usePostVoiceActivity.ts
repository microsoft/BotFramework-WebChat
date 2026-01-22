import { type WebChatActivity } from 'botframework-webchat-core';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Hook to post voice activities (fire-and-forget, no echo back).
 */
export default function usePostVoiceActivity(): (activity: WebChatActivity) => void {
  return useWebChatAPIContext().postVoiceActivity;
}
