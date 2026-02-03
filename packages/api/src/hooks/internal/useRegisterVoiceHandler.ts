import { registerVoiceHandler, unregisterVoiceHandler, type VoiceHandler } from 'botframework-webchat-core';
import { useCallback } from 'react';
import randomId from '../../utils/randomId';
import { useDispatch } from './WebChatReduxContext';

/**
 * Internal hook to register a voice handler for audio playback.
 * @returns A function that registers a voice handler and returns an unregister function.
 */
export default function useRegisterVoiceHandler(): (voiceHandler: VoiceHandler) => () => void {
  const dispatch = useDispatch();

  return useCallback(
    (voiceHandler: VoiceHandler) => {
      const id = randomId();
      dispatch(registerVoiceHandler(id, voiceHandler));
      return () => {
        dispatch(unregisterVoiceHandler(id));
      };
    },
    [dispatch]
  );
}
