import { type VoiceHandler } from 'botframework-webchat-core';

import { useVoiceContext } from './domains/VoiceContext';

/**
 * Internal hook to register a voice handler for audio playback.
 * @returns A function that registers a voice handler and returns an unregister function.
 */
export default function useRegisterVoiceHandler(): (voiceHandler: VoiceHandler) => () => void {
  return useVoiceContext().registerVoiceHandler;
}
