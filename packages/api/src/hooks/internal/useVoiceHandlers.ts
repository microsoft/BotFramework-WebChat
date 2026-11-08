import type { VoiceHandler } from 'botframework-webchat-core';

import { useVoiceContext } from './domains/VoiceContext';
import useSourceValue from './domains/useSourceValue';

/**
 * Internal hook to get all registered voice handlers.
 */
export default function useVoiceHandlers(): readonly [ReadonlyMap<string, VoiceHandler>] {
  return Object.freeze([useSourceValue(useVoiceContext().voiceHandlers)]);
}
