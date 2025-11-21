import type { LocalId } from './property/LocalId';
import type { State } from './types';
import { updateActivityChannelDataInternalSkipNameCheck } from './updateActivityChannelData';

export default function updateSendState(
  state: State,
  activityLocalId: LocalId,
  sendState: 'sending' | 'send failed' | 'sent'
): State {
  state = updateActivityChannelDataInternalSkipNameCheck(state, activityLocalId, 'state', sendState);

  state = updateActivityChannelDataInternalSkipNameCheck(state, activityLocalId, 'webchat:send-status', sendState);

  return state;
}
