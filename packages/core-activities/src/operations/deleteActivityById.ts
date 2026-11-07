import deleteActivityByLocalId from '../deleteActivityByLocalId';
import queryLocalIdByActivityId from '../queryLocalIdByActivityId';
import type { ActivitiesCoreState } from '../types';

/**
 * Deletes the activity with the ID. Does nothing if there is none.
 *
 * Same as `DELETE_ACTIVITY` in core's reducer, without its deprecation warning.
 */
export default function deleteActivityById(state: ActivitiesCoreState, activityId: string): ActivitiesCoreState {
  const localId = queryLocalIdByActivityId(state, activityId);

  if (localId) {
    state = deleteActivityByLocalId(state, localId);
  }

  return state;
}
