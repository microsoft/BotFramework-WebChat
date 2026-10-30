import { check, parse, pipe, string, type GenericSchema } from 'valibot';
import { replaceActivity } from './graph/activityNode';
import deriveState from './graph/deriveState';
import { getLocalIdFromActivity, type LocalId } from './property/LocalId';
import type { Activity, State } from './types';

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
  const node = state.graph?.store.getSnapshot().get(activityLocalId);

  if (!activityEntry || !state.graph || !node) {
    throw new Error(`botframework-webchat: no activity found with internal ID ${activityLocalId}`);
  }

  if (!state.sortedActivities.some(activity => getLocalIdFromActivity(activity) === activityLocalId)) {
    throw new Error(`botframework-webchat: no activity found in sortedActivities with internal ID ${activityLocalId}`);
  }

  // TODO: [P0] We will freeze activity in future.
  const nextActivity: Activity = {
    ...activityEntry.activity,
    channelData: {
      ...activityEntry.activity.channelData,
      [name]: value
    } as any
  };

  // Replaces the activity in its node, without moving it.
  state.graph.edit(transaction => replaceActivity(transaction, node, nextActivity));

  return deriveState(state.graph);
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
