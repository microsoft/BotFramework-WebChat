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

export default function (state = DEFAULT_STATE, { meta, payload, type }) {
  switch (type) {
    case UPSERT_ACTIVITY:
      // TODO: UpdateActivity is not supported right now

      // Do not add the activity if it already exists, dedupe by Activity.id
      if (!~state.findIndex(id => id === payload.activity.id)) {
        const { channelData: { clientActivityID } = {} } = payload.activity;

        // Tries to update the activity if the incoming activity has clientActivityID
        const nextState = clientActivityID ? updateIn(state, [findByClientActivityID(clientActivityID)], activity => ({
          ...activity,
          ...payload.activity
        })) : state;

        // If the incoming activity has no clientActivityID, or we cannot find existing activity with the same clientActivityID, append it
        if (nextState === state) {
          state = [...state, payload.activity];
        }
      }

      break;

    case POST_ACTIVITY_PENDING:
      state = [...state, updateIn(payload.activity, ['channelData', 'state'], () => 'sending')];
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
