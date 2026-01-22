import { useCallback, useMemo } from 'react';
import useVoiceRecording from './internal/useVoiceRecording';
import useSpeechState from './internal/useSpeechState';
import { SpeechToSpeech } from '../types/SpeechToSpeech';
import useWebChatAPIContext from './internal/useWebChatAPIContext';

/**
 * Hook to access speech-to-speech state and controls.
 */
export default function useSpeechToSpeech(): readonly [SpeechToSpeech] {
  const { startVoiceRecording, stopVoiceRecording } = useWebChatAPIContext();
  const [recording] = useVoiceRecording();
  const [speechState] = useSpeechState();

  const setRecording = useCallback(
    (shouldRecord: boolean) => {
      if (shouldRecord) {
        startVoiceRecording();
      } else {
        stopVoiceRecording();
      }
    },
    [startVoiceRecording, stopVoiceRecording]
  );

  return useMemo(
    () => [
      {
        recording,
        setRecording,
        speechState
      }
    ],
    [recording, setRecording, speechState]
  );
}
