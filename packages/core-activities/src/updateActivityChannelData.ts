import { check, is, parse, pipe, string, type GenericSchema } from 'valibot';
import { replaceActivity, setSendStatus } from './graph/activityNode';
import editState from './graph/editState';
import { getLocalIdFromActivity, type LocalId } from './property/LocalId';
import { SendStatusSchema } from './property/SendStatus';
import type { State } from './types';

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

  if (!state.sortedActivities.some(activity => getLocalIdFromActivity(activity) === activityLocalId)) {
    throw new Error(`botframework-webchat: no activity found in sortedActivities with internal ID ${activityLocalId}`);
  }

  return editState(state, working => {
    const node = working.getNode(activityLocalId);

    if (!node) {
      throw new Error(`botframework-webchat: no activity found with internal ID ${activityLocalId}`);
    }

    if (name === 'webchat:send-status' && is(SendStatusSchema, value)) {
      // The send status lives on the node (`urn:microsoft:webchat:send-status`); the activity is left as-is.
      setSendStatus(working, node, value);
    } else {
      // TODO: [P0] We will freeze activity in future.
      replaceActivity(working, node, {
        ...activityEntry.activity,
        channelData: {
          ...activityEntry.activity.channelData,
          [name]: value
        } as any
      });
    }

    return true;
  });
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
