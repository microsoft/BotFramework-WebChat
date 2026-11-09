import type { VoiceHandler } from 'botframework-webchat-core';
import { useSelector } from './WebChatReduxContext';

const selectVoiceHandlers = (state: { voice: { voiceHandlers: Map<string, VoiceHandler> } }) =>
  state.voice.voiceHandlers;

/**
 * Internal hook to get all registered voice handlers from Redux state.
 */
export default function useVoiceHandlers(): readonly [ReadonlyMap<string, VoiceHandler>] {
  return Object.freeze([useSelector(selectVoiceHandlers)]);
}
