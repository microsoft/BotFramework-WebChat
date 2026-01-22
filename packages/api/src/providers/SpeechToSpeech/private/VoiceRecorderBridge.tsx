import { useEffect, useCallback, useRef } from 'react';
import { useRecorder } from './useRecorder';
import usePostVoiceActivity from '../../../hooks/usePostVoiceActivity';
import useVoiceRecording from '../../../hooks/internal/useVoiceRecording';
import useVoiceHandler from '../../../hooks/internal/useVoiceHandler';

/**
 * VoiceRecorderBridge is an invisible component that bridges the Redux recording state
 * with the actual microphone recording functionality.
 */
export function VoiceRecorderBridge(): null {
  const [recording] = useVoiceRecording();
  const [voiceHandler] = useVoiceHandler();
  const postVoiceActivity = usePostVoiceActivity();
  const prevRecordingRef = useRef(recording);

  const handleAudioChunk = useCallback(
    (base64: string, timestamp: string) => {
      postVoiceActivity({
        type: 'event',
        name: 'stream.chunk',
        payload: {
          voice: {
            contentType: 'audio/webm',
            content: base64,
            timestamp
          }
        }
      } as any);
    },
    [postVoiceActivity]
  );

  const { startRecording, stopRecording } = useRecorder(handleAudioChunk);

  useEffect(() => {
    // This is to check transition of recording state, it it does not match then perorm actions
    const wasRecording = prevRecordingRef.current;
    prevRecordingRef.current = recording;

    if (recording && !wasRecording) {
      startRecording();
    } else if (!recording && wasRecording) {
      voiceHandler.stopAudio();
      stopRecording();
    }

    return () => {
      stopRecording();
    };
  }, [recording, startRecording, stopRecording, voiceHandler]);

  return null;
}
