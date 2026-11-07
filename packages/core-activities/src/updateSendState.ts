import type { LocalId } from './property/LocalId';
import type { State } from './types';
import { updateActivityChannelDataInternalSkipNameCheck } from './updateActivityChannelData';

/**
 * @deprecated Channel data update is obsoleted, re-upsert instead.
 * @param state
 * @param activityLocalId
 * @param sendState
 * @returns
 */
export default function updateSendState(
  state: State,
  activityLocalId: LocalId,
  sendState: 'sending' | 'send failed' | 'sent'
): State {
  state = updateActivityChannelDataInternalSkipNameCheck(state, activityLocalId, 'state', sendState);

  state = updateActivityChannelDataInternalSkipNameCheck(state, activityLocalId, 'webchat:send-status', sendState);

  return state;
}
