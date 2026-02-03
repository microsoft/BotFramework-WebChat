import type { VoiceHandler } from 'botframework-webchat-core';
import { useSelector } from './WebChatReduxContext';

/**
 * Internal hook to get all registered voice handlers from Redux state.
 */
export default function useVoiceHandlers(): readonly [ReadonlyMap<string, VoiceHandler>] {
  return Object.freeze([
    useSelector((state: { voice: { voiceHandlers: Map<string, VoiceHandler> } }) => state.voice.voiceHandlers)
  ]);
}
