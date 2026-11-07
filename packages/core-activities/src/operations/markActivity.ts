import queryLocalIdByActivityId from '../queryLocalIdByActivityId';
import type { ActivitiesCoreState } from '../types';
import updateActivityChannelData from '../updateActivityChannelData';

/**
 * Sets `channelData[name]` of the activity with the ID (used by speech). Does nothing if there is none. Throws if the
 * name is reserved (`state`, `stream*`, `webchat:*`).
 *
 * Same as `MARK_ACTIVITY` in core's reducer.
 */
export default function markActivity(
  state: ActivitiesCoreState,
  activityId: string,
  name: string,
  value: unknown
): ActivitiesCoreState {
  const localId = queryLocalIdByActivityId(state, activityId);

  if (localId) {
    state = updateActivityChannelData(state, localId, name, value);
  }

  return state;
}
