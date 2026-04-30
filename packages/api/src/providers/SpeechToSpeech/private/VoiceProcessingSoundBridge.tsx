import { useEffect, useMemo } from 'react';

import getVoiceProcessingSound from './voiceProcessingSound';
import useShouldShowMicrophoneButton from '../../../hooks/internal/useShouldShowMicrophoneButton';
import useStyleOptions from '../../../hooks/useStyleOptions';
import useVoiceState from '../../../hooks/useVoiceState';

const DEFAULT_VOLUME = 0.5;
const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

// Constrain `value` to `[min, max]`. e.g. clamp(2, 0, 1) → 1; clamp(-0.3, 0, 1) → 0; clamp(0.4, 0, 1) → 0.4.
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ignoreError = () => {
  // Ignore autoplay-policy rejection.
};

/**
 * Plays the audio from the start; returns a stop function that pauses and rewinds.
 */
const play = (audio: HTMLAudioElement) => {
  audio.currentTime = 0;
  audio.play().catch(ignoreError);

  return () => {
    audio.pause();
    audio.currentTime = 0;
  };
};

/**
 * Plays a (looping) audio cue while voice mode is `'processing'`.
 *
 * Style options:
 * - `voiceProcessingSound`       — URL/data-URI; `false` disables; when unset uses the bundled default.
 * - `voiceProcessingSoundLoop`   — defaults to `true`.
 * - `voiceProcessingSoundVolume` — `0`–`1`, defaults to `0.5`.
 *
 * Skipped entirely when the microphone button is hidden — no mic means no voice flow to cue.
 */
export const VoiceProcessingSoundBridge = () => {
  const [{ voiceProcessingSound, voiceProcessingSoundLoop, voiceProcessingSoundVolume }] = useStyleOptions();
  const [voiceState] = useVoiceState();
  const shouldShowMicrophoneButton = useShouldShowMicrophoneButton();

  // Resolve the source: explicit `false` disables; an explicit string is used as-is;
  // `undefined` falls back to the lazily-created default `blob:` URL.
  const source = voiceProcessingSound === false ? undefined : (voiceProcessingSound ?? getVoiceProcessingSound());

  const audio = useMemo(() => {
    if (!shouldShowMicrophoneButton || !source) {
      return undefined;
    }

    const instance = new Audio(source);

    instance.loop = voiceProcessingSoundLoop ?? true;
    instance.volume = clamp(voiceProcessingSoundVolume ?? DEFAULT_VOLUME, MIN_VOLUME, MAX_VOLUME);

    return instance;
  }, [shouldShowMicrophoneButton, source, voiceProcessingSoundLoop, voiceProcessingSoundVolume]);

  useEffect(() => {
    if (audio && voiceState === 'processing') {
      return play(audio);
    }
  }, [audio, voiceState]);

  return null;
};
