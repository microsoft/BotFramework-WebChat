import { VoiceHandler } from 'botframework-webchat-core';
import { useSelector } from './WebChatReduxContext';

/**
 * Hook to get the current voice handler from Redux state.
 */
export default function useVoiceHandler(): [VoiceHandler | null] {
  return [useSelector(({ voice }) => voice.voiceHandler)];
}
