import updateIn from 'simple-update-in';

import { DELETE_ACTIVITY } from '../Actions/deleteActivity';
import { MARK_ACTIVITY } from '../Actions/markActivity';
import { UPSERT_ACTIVITY } from '../Actions/upsertActivity';

import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../Actions/postActivity';

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
    // We will remove all "typing" and "sending messages" activities
    // "clientActivityID" is unique and used to track if the message has been sent and echoed back from the server
    !(
      (type === 'typing' && from.id === nextFromID)
      || (nextClientActivityID && clientActivityID === nextClientActivityID)
    )
  );

  // Then, find the right (sorted) place to insert the new activity at, based on timestamp, and must be before "typing"
  // Since clockskew might happen, we will ignore timestamp on messages that are sending
  // If we are inserting "typing", we will always append it
  const indexToInsert = nextActivity.type === 'typing' ? -1 : nextActivities.findIndex(({ channelData: { state } = {}, timestamp, type }) =>
    (Date.parse(timestamp) > nextTimestamp && state !== 'sending' && state !== 'send failed') || type === 'typing'
  );

  // If no right place are found, append it
  nextActivities.splice(~indexToInsert ? indexToInsert : nextActivities.length, 0, nextActivity);

  return nextActivities;
}

export default function (state = DEFAULT_STATE, { meta, payload, type }) {
  switch (type) {
    case DELETE_ACTIVITY:
      state = updateIn(state, [({ id }) => id === payload.activityID]);
      break;

    case MARK_ACTIVITY:
      console.log(`MARK_ACTIVITY`);
      console.log(payload);
      state = updateIn(state, [({ id }) => id === payload.activityID, 'channelData', payload.name], () => payload.value);
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

    case UPSERT_ACTIVITY:
      // UpdateActivity is not supported right now because we ignore duplicated activity ID
      if (!~state.findIndex(({ id }) => id === payload.activity.id)) {
        state = upsertActivityWithSort(state, payload.activity);
      }

      break;

    default: break;
  }

  return state;
}
