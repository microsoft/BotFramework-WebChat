import type { VoiceHandler } from 'botframework-webchat-core';
import { useSelector } from './WebChatReduxContext';

/**
 * Internal hook to get all registered voice handlers from Redux state.
 */
export default function useVoiceHandlers(): [readonly VoiceHandler[]] {
  return [useSelector((state: { voice: { voiceHandlers } }) => Array.from(state.voice.voiceHandlers.values()))];
}
