import type { VoiceHandler } from 'botframework-webchat-core';

import { useVoiceHandlersSlice } from './domains/VoiceSlices';

/**
 * Internal hook to get all registered voice handlers.
 */
export default function useVoiceHandlers(): readonly [ReadonlyMap<string, VoiceHandler>] {
  return Object.freeze([useVoiceHandlersSlice()]);
}
