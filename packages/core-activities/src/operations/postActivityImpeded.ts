import queryLocalIdByClientActivityId from '../queryLocalIdByClientActivityId';
import type { ActivitiesCoreState } from '../types';
import { SEND_FAILED } from '../types/internal/SendStatus';
import { updateActivityChannelDataInternalSkipNameCheck } from '../updateActivityChannelData';

/**
 * The chat adapter could not send the activity yet: marks the outgoing activity "send failed" in `channelData.state`
 * only. Does nothing if there is no outgoing activity with the client activity ID.
 *
 * Same as `POST_ACTIVITY_IMPEDED` in core's reducer.
 */
export default function postActivityImpeded(state: ActivitiesCoreState, clientActivityID: string): ActivitiesCoreState {
  const localId = queryLocalIdByClientActivityId(state, clientActivityID);

  if (localId) {
    state = updateActivityChannelDataInternalSkipNameCheck(
      state,
      localId,
      // `channelData.state` is being deprecated in favor of `channelData['webchat:send-status']`.
      // Please refer to #4362 for details. Remove on or after 2024-07-31.
      'state',
      SEND_FAILED
    );
  }

  return state;
}
