import { check, parse, pipe, string, type GenericSchema } from 'valibot';
import { getLocalIdFromActivity, type LocalId } from './property/LocalId';
import type { Activity, ActivityMapEntry, State } from './types';

const channelDataNameSchema: GenericSchema<
  Exclude<string, 'state' | 'streamId' | 'streamSequence' | 'streamType' | `webchat:${string}`>
> = pipe(
  string(),
  check(
    value =>
      value !== 'state' &&
      value !== 'streamId' &&
      value !== 'streamSequence' &&
      value !== 'streamType' &&
      !value.startsWith('webchat:'),
    'name must not be a reserved'
  )
);

/**
 * Updates activity channel data.
 *
 * Note: after channel data is updated, it will not update to a new position.
 *       Do not use this function for updating channel data that would affect position, such as `streamSequence`.
 *
 * @param state
 * @param activityLocalId
 * @param name
 * @param value
 * @returns
 */
function updateActivityChannelDataInternalSkipNameCheck(
  state: State,
  activityLocalId: LocalId,
  name: string,
  value: unknown
): State {
  const activityEntry = state.activityMap.get(activityLocalId);

  if (!activityEntry) {
    throw new Error(`botframework-webchat: no activity found with internal ID ${activityLocalId}`);
  }

  // TODO: [P0] We will freeze activity in future.
  const nextActivity: Activity = {
    ...activityEntry.activity,
    channelData: {
      ...activityEntry.activity.channelData,
      [name]: value
    } as any
  };

  const nextActivityMap = new Map(state.activityMap).set(
    activityLocalId,
    Object.freeze({ ...activityEntry, activity: nextActivity } satisfies ActivityMapEntry)
  );

  const nextSortedActivities = Array.from(state.sortedActivities);

  const existingActivityIndex = nextSortedActivities.findIndex(
    activity => getLocalIdFromActivity(activity) === activityLocalId
  );

  if (!~existingActivityIndex) {
    throw new Error(`botframework-webchat: no activity found in sortedActivities with internal ID ${activityLocalId}`);
  }

  nextSortedActivities[+existingActivityIndex] = nextActivity;

  return Object.freeze({
    ...state,
    activityMap: Object.freeze(nextActivityMap),
    sortedActivities: Object.freeze(nextSortedActivities)
  } satisfies State);
}

/**
 * Update activity channel data.
 *
 * @deprecated Channel data update is being deprecated, please use a custom state management solution instead.
 * @param state
 * @param activityLocalId
 * @param name
 * @param value
 * @returns
 */
function updateActivityChannelData(state: State, activityLocalId: LocalId, name: string, value: unknown): State {
  if (name.startsWith('webchat:')) {
    throw new Error('botframework-webchat: custom channel data name must not use prefix "webchat:"');
  }

  return updateActivityChannelDataInternalSkipNameCheck(
    state,
    activityLocalId,
    parse(channelDataNameSchema, name),
    value
  );
}

export default updateActivityChannelData;
export { updateActivityChannelDataInternalSkipNameCheck };
