import { check, parse, pipe, string, type GenericSchema } from 'valibot';
import getActivityInternalId from './private/getActivityInternalId';
import type { Activity, ActivityInternalIdentifier, ActivityMapEntry, State } from './types';

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
 * @param activityInternalIdentifier
 * @param name
 * @param value
 * @returns
 */
function updateActivityChannelDataInternalSkipNameCheck(
  state: State,
  activityInternalIdentifier: ActivityInternalIdentifier,
  name: string,
  // TODO: [P*] Should we check the validity of the value?
  value: unknown
): State {
  const activityEntry = state.activityMap.get(activityInternalIdentifier);

  if (!activityEntry) {
    throw new Error(`botframework-webchat: no activity found with internal ID ${activityInternalIdentifier}`);
  }

  // TODO: [P*] Should we freeze the activity?
  const nextActivity: Activity = {
    ...activityEntry.activity,
    channelData: {
      ...activityEntry.activity.channelData,
      [name]: value
    } as any
  };

  const nextActivityMap = new Map(state.activityMap).set(
    activityInternalIdentifier,
    Object.freeze({ ...activityEntry, activity: nextActivity } satisfies ActivityMapEntry)
  );

  const nextSortedActivities = Array.from(state.sortedActivities);

  const existingActivityIndex = nextSortedActivities.findIndex(
    activity => getActivityInternalId(activity) === activityInternalIdentifier
  );

  if (!~existingActivityIndex) {
    throw new Error(
      `botframework-webchat: no activity found in sortedActivities with internal ID ${activityInternalIdentifier}`
    );
  }

  nextSortedActivities[+existingActivityIndex] = nextActivity;

  return Object.freeze({
    ...state,
    activityMap: Object.freeze(nextActivityMap),
    sortedActivities: Object.freeze(nextSortedActivities)
  } satisfies State);
}

function updateActivityChannelData(
  state: State,
  activityInternalIdentifier: ActivityInternalIdentifier,
  name: string,
  // TODO: [P*] Should we check the validity of the value?
  value: unknown
): State {
  return updateActivityChannelDataInternalSkipNameCheck(
    state,
    activityInternalIdentifier,
    parse(channelDataNameSchema, name),
    value
  );
}

export default updateActivityChannelData;
export { updateActivityChannelDataInternalSkipNameCheck };
