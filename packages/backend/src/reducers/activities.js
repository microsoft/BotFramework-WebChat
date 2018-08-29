import updateIn from 'simple-update-in';

import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../Actions/postActivity';
import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';

const DEFAULT_STATE = [];

function getClientActivityID({ channelData: { clientActivityID } = {} }) {
  return clientActivityID;
}

function findByClientActivityID(clientActivityID) {
  return activity => getClientActivityID(activity) === clientActivityID;
}

function upsertActivityWithSort(activities, nextActivity) {
  const {
    channelData: { clientActivityID: nextClientActivityID } = {},
    from: { id: nextFromID } = {}
  } = nextActivity;

  const nextTimestamp = Date.parse(nextActivity.timestamp);
  const nextActivities = activities.filter(({ channelData: { clientActivityID } = {}, from, type }) =>
    // We will remove all "typing" and "echo back" activities
    !(
      (type === 'typing' && from.id === nextFromID)
      || (nextClientActivityID && clientActivityID === nextClientActivityID)
    )
  );

  // Then, find the right (sorted) place to insert the new activity at, based on timestamp, and must be before "typing"
  // If we are inserting "typing", we will always append it
  const indexToInsert = nextActivity.type === 'typing' ? -1 : nextActivities.findIndex(({ timestamp, type }) => Date.parse(timestamp) > nextTimestamp || type === 'typing');

  // If no right place are found, append it
  nextActivities.splice(~indexToInsert ? indexToInsert : nextActivities.length, 0, nextActivity);

  return nextActivities;
}

export default function (state = DEFAULT_STATE, { meta, payload, type }) {
  switch (type) {
    case UPSERT_ACTIVITY:
      // TODO: UpdateActivity is not supported right now

      // Do not add the activity if it already exists, dedupe by Activity.id
      if (!~state.findIndex(id => id === payload.activity.id)) {
        state = upsertActivityWithSort(state, payload.activity);
      }

      break;

    case POST_ACTIVITY_PENDING:
      state = upsertActivityWithSort(state, updateIn(payload.activity, ['channelData', 'state'], () => 'sending'));
      break;

    case POST_ACTIVITY_REJECTED:
      state = updateIn(state, [findByClientActivityID(meta.clientActivityID), 'channelData', 'state'], () => 'send failed');
      break;

    case POST_ACTIVITY_FULFILLED:
      state = updateIn(state, [findByClientActivityID(meta.clientActivityID)], activity =>
        // We will replace the activity with the version from the server
        updateIn(payload.activity, ['channelData', 'state'], () => 'sent')
      );

      break;

    default: break;
  }

  // TODO: Should we sort the state?

  return state;
}
