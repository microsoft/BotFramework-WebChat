import { type VoiceState } from 'botframework-webchat-core';

import { useVoiceContext } from './domains/VoiceContext';
import { useVoiceStateSlice } from './domains/VoiceSlices';

/**
 * Internal hook to set the voice state.
 */
export default function useVoiceStateWritable(): readonly [VoiceState, (state: VoiceState) => void] {
  const { setVoiceState } = useVoiceContext();

  return Object.freeze([useVoiceStateSlice(), setVoiceState]);
}
