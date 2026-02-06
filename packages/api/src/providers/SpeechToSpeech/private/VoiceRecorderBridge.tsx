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

  const muted = voiceState === 'muted';
  // Derive recording state from voiceState - recording is active when not idle
  const recording = voiceState !== 'idle';

  const handleAudioChunk = useCallback(
    (base64: string, timestamp: string) => {
      postVoiceActivity({
        name: 'media.chunk',
        type: 'event',
        value: {
          contentType: 'audio/webm',
          content: base64,
          timestamp
        }
      } as any);
    },
    [postVoiceActivity]
  );

  const { record, mute } = useRecorder(handleAudioChunk);

  useEffect(() => {
    if (muted) {
      return mute();
    }
  }, [mute, muted]);

  useEffect(() => {
    if (recording) {
      return record();
    }
  }, [record, recording]);

  return null;
}
