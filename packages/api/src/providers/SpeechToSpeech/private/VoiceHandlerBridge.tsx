import { useEffect } from 'react';

import useStyleOptions from '../../../hooks/useStyleOptions';
import useWebChatAPIContext from '../../../hooks/internal/useWebChatAPIContext';
import { useAudioPlayer } from './useAudioPlayer';

/**
 * VoiceHandlerBridge is an invisible component that registers the audio player
 * functions (playAudio, stopAudio) with Redux.
 */
export const VoiceHandlerBridge = () => {
  const { registerVoiceHandler } = useWebChatAPIContext();
  const { playAudio, stopAudio } = useAudioPlayer();

  const [{ showMicrophoneButton }] = useStyleOptions();

  useEffect(() => {
    if (!showMicrophoneButton) {
      return;
    }
    registerVoiceHandler({ playAudio, stopAudio });
    return () => {
      registerVoiceHandler(null);
    };
  }, [registerVoiceHandler, playAudio, stopAudio, showMicrophoneButton]);

  return null;
};
