import { useEffect, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useRecorder } from './useRecorder';
import usePostVoiceActivity from '../../../hooks/internal/usePostVoiceActivity';
import useVoiceRecordingMuted from '../../../hooks/useVoiceRecordingMuted';
import useVoiceState from '../../../hooks/useVoiceState';

/**
 * VoiceRecorderBridge is an invisible component that bridges the Redux recording state
 * with the actual microphone recording functionality.
 */
export function VoiceRecorderBridge(): null {
  const [muted] = useVoiceRecordingMuted();
  const [voiceState] = useVoiceState();
  const mutedRef = useRefFrom(muted);
  const postVoiceActivity = usePostVoiceActivity();

  // Derive recording state from voiceState - recording is active when not idle
  const recording = voiceState !== 'idle';

  const handleAudioChunk = useCallback(
    (base64: string, timestamp: string) => {
      postVoiceActivity({
        name: 'media.chunk',
        type: 'event',
        value: {
          contentType: 'audio/webm',
          // While muted, send silence: the worklet may still send audio recorded before it received MUTE.
          // "A" is 0 in base64 and "=" is padding, so this zeroes every byte.
          content: mutedRef.current ? base64.replace(/[^=]/gu, 'A') : base64,
          timestamp
        }
      } as any);
    },
    [mutedRef, postVoiceActivity]
  );

  const { mute, record } = useRecorder(handleAudioChunk);

  useEffect(() => {
    if (recording) {
      return record();
    }
  }, [record, recording]);

  useEffect(() => {
    if (muted) {
      return mute();
    }
  }, [muted, mute]);

  return null;
}
