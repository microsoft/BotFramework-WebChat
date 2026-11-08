import { type VoiceState } from 'botframework-webchat-core';

import { useVoiceContext } from './domains/VoiceContext';
import useSourceValue from './domains/useSourceValue';

/**
 * Internal hook to set the voice state.
 */
export default function useVoiceStateWritable(): readonly [VoiceState, (state: VoiceState) => void] {
  const { setVoiceState, voiceState } = useVoiceContext();

  return Object.freeze([useSourceValue(voiceState), setVoiceState]);
}
