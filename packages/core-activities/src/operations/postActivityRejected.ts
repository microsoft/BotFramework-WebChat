import queryLocalIdByClientActivityId from '../queryLocalIdByClientActivityId';
import type { ActivitiesCoreState } from '../types';
import { SEND_FAILED } from '../types/internal/SendStatus';
import { updateActivityChannelDataInternalSkipNameCheck } from '../updateActivityChannelData';

/**
 * The chat adapter failed to send the activity: marks the outgoing activity "send failed". Does nothing if there is no
 * outgoing activity with the client activity ID.
 *
 * Same as `POST_ACTIVITY_REJECTED` in core's reducer.
 */
export default function postActivityRejected(
  state: ActivitiesCoreState,
  clientActivityID: string
): ActivitiesCoreState {
  const localId = queryLocalIdByClientActivityId(state, clientActivityID);

  if (localId) {
    state = updateActivityChannelDataInternalSkipNameCheck(state, localId, 'state', SEND_FAILED);
    state = updateActivityChannelDataInternalSkipNameCheck(state, localId, 'webchat:send-status', SEND_FAILED);
  }

  return state;
}
