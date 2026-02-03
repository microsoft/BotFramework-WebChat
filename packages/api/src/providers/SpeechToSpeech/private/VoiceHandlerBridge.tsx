import { useEffect } from 'react';
import { useAudioPlayer } from './useAudioPlayer';
import useRegisterVoiceHandler from '../../../hooks/internal/useRegisterVoiceHandler';
import useShouldShowMicrophoneButton from '../../../hooks/internal/useShouldShowMicrophoneButton';

/**
 * VoiceHandlerBridge is an invisible component that registers the audio player
 * functions (queueAudio, stopAllAudio) with Redux
 */
export const VoiceHandlerBridge = () => {
  const { queueAudio, stopAllAudio } = useAudioPlayer();
  const registerVoiceHandler = useRegisterVoiceHandler();
  const shouldShowMicrophoneButton = useShouldShowMicrophoneButton();

  useEffect(() => {
    if (!shouldShowMicrophoneButton) {
      return;
    }
    return registerVoiceHandler({ queueAudio, stopAllAudio });
  }, [queueAudio, registerVoiceHandler, shouldShowMicrophoneButton, stopAllAudio]);

  return null;
};
