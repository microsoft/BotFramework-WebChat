import { useEffect, useCallback } from 'react';
import { useRecorder } from './useRecorder';
import usePostVoiceActivity from '../../../hooks/internal/usePostVoiceActivity';
import useVoiceState from '../../../hooks/useVoiceState';

/**
 * VoiceRecorderBridge is an invisible component that bridges the Redux recording state
 * with the actual microphone recording functionality.
 */
export function VoiceRecorderBridge(): null {
  const [voiceState] = useVoiceState();
  const postVoiceActivity = usePostVoiceActivity();

  // Derive recording state from voiceState - recording is active when not idle
  const recording = voiceState !== 'idle';

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

  const { record } = useRecorder(handleAudioChunk);

  useEffect(() => {
    if (recording) {
      return record();
    }
  }, [record, recording]);

  return null;
}
