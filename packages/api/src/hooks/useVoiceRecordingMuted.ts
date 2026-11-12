import { useVoiceContext } from './internal/domains/VoiceContext';
import { useMicrophoneMutedSlice } from './internal/domains/VoiceSlices';

/**
 * Hook to get and set voice recording mute state in speech-to-speech mode.
 *
 * Mute is independent of voice state - it can be toggled at any time.
 * When muted, silent audio chunks are sent instead of real audio.
 * Mute resets to false when recording stops.
 */
export default function useVoiceRecordingMuted(): readonly [boolean, (muted: boolean) => void] {
  const { setMuted } = useVoiceContext();

  return Object.freeze([useMicrophoneMutedSlice(), setMuted]);
}
