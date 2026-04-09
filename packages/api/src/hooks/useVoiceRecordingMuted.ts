import { muteVoiceRecording, unmuteVoiceRecording } from 'botframework-webchat-core';
import { useCallback } from 'react';
import { useDispatch, useSelector } from './internal/WebChatReduxContext';

/**
 * Hook to get and set voice recording mute state in speech-to-speech mode.
 *
 * Mute is independent of voice state - it can be toggled at any time.
 * When muted, silent audio chunks are sent instead of real audio.
 * Mute resets to false when recording stops.
 */
export default function useVoiceRecordingMuted(): readonly [boolean, (muted: boolean) => void] {
  const dispatch = useDispatch();
  const value = useSelector(({ voice }) => voice.microphoneMuted);

  const setter = useCallback(
    (muted: boolean) => {
      dispatch(muted ? muteVoiceRecording() : unmuteVoiceRecording());
    },
    [dispatch]
  );

  return Object.freeze([value, setter]);
}
