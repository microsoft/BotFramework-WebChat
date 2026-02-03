import type { VoiceState } from 'botframework-webchat-core';
import useVoiceStateWritable from './internal/useVoiceStateWritable';

/**
 * Hook to get the voice state.
 * The voice state represents the current state of the speech-to-speech interaction:
 * - 'idle': No active speech session, microphone and audio playback are off
 * - 'listening': Microphone is active
 * - 'user_speaking': User is actively speaking
 * - 'processing': User finished speaking, server is processing
 * - 'bot_speaking': Bot is speaking (audio playback)
 */
export default function useVoiceState(): readonly [VoiceState] {
  return Object.freeze([useVoiceStateWritable()[0]]);
}
