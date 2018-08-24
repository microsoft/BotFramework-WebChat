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

function upsertActivityByClientActivityID(state, activity) {
  const clientActivityID = getClientActivityID(activity);

  // If the activity has clientActivityID, try to update existing activity
  if (clientActivityID) {
    // Tries to update the activity if the incoming activity has clientActivityID
    const nextState = updateIn(state, [findByClientActivityID(clientActivityID)], existingActivity => ({
      ...existingActivity,
      ...activity
    }));

    if (nextState !== state) {
      return nextState;
    }
  }

  return [...state, activity];
}

export default function (state = DEFAULT_STATE, { meta, payload, type }) {
  switch (type) {
    case UPSERT_ACTIVITY:
      // TODO: UpdateActivity is not supported right now

      // Do not add the activity if it already exists, dedupe by Activity.id
      if (!~state.findIndex(id => id === payload.activity.id)) {
        state = upsertActivityByClientActivityID(state, payload.activity);
      }

      break;

    case POST_ACTIVITY_PENDING:
      state = upsertActivityByClientActivityID(state, updateIn(payload.activity, ['channelData', 'state'], () => 'sending'));
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
