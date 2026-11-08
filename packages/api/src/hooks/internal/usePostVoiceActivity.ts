import { type WebChatActivity } from 'botframework-webchat-core';

import { useVoiceContext } from './domains/VoiceContext';

/**
 * Hook to post voice activities (fire-and-forget, no echo back).
 * Use this for DTMF and other voice-related event activities.
 */
export default function usePostVoiceActivity(): (activity: WebChatActivity) => void {
  return useVoiceContext().postVoiceActivity;
}
