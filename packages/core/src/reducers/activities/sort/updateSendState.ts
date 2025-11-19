import type { ActivityInternalIdentifier, State } from './types';
import { updateActivityChannelDataInternalSkipNameCheck } from './updateActivityChannelData';

export default function updateSendState(
  state: State,
  activityInternalIdentifier: ActivityInternalIdentifier,
  sendState: 'sending' | 'send failed' | 'sent'
): State {
  state = updateActivityChannelDataInternalSkipNameCheck(state, activityInternalIdentifier, 'state', sendState);

  state = updateActivityChannelDataInternalSkipNameCheck(
    state,
    activityInternalIdentifier,
    'webchat:send-status',
    sendState
  );

  return state;
}
