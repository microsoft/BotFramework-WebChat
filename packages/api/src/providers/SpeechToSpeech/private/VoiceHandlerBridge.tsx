import { useEffect } from 'react';

import useStyleOptions from '../../../hooks/useStyleOptions';
import useRegisterVoiceHandler from '../../../hooks/internal/useRegisterVoiceHandler';
import { useAudioPlayer } from './useAudioPlayer';

/**
 * VoiceHandlerBridge is an invisible component that registers the audio player
 * functions (queueAudio, stopAllAudio) with Redux
 */
export const VoiceHandlerBridge = () => {
  const registerVoiceHandler = useRegisterVoiceHandler();
  const { queueAudio, stopAllAudio } = useAudioPlayer();
  const [{ showMicrophoneButton }] = useStyleOptions();

  useEffect(() => {
    if (!showMicrophoneButton) {
      return;
    }
    return registerVoiceHandler({ queueAudio, stopAllAudio });
  }, [registerVoiceHandler, queueAudio, stopAllAudio, showMicrophoneButton]);

  return null;
};
