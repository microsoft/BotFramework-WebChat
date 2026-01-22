import type { SpeechState } from 'botframework-webchat-core';
import { useSelector } from './WebChatReduxContext';

/**
 * Hook to get the voice speech state.
 * The speech state represents the current state of the speech-to-speech interaction:
 * - 'idle': No active speech session
 * - 'listening': Microphone is active
 * - 'user_speaking': User is actively speaking
 * - 'processing': User finished speaking, server is processing
 * - 'bot_speaking': Bot is speaking (audio playback)
 */
export default function useSpeechState(): [SpeechState] {
  return [useSelector(({ voice }) => voice.speechState)];
}
