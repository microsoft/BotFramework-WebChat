import updateIn from 'simple-update-in';

import {
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED
} from '../Actions/postActivity';
import { RECEIVE_ACTIVITY } from '../Actions/receiveActivity';

const DEFAULT_STATE = [];

function updateActivity(activities, clientActivityID, updater) {
  if (!clientActivityID || typeof clientActivityID !== 'string') {
    throw new Error('must specify clientActivityID');
  }

  return activities.map(activity => {
    const { channelData } = activity;

    if (channelData && channelData.clientActivityID === clientActivityID) {
      return updater(activity);
    } else {
      return activity;
    }
  });
}

function handleReceiveActivity(state, nextActivity) {
  const { channelData: { clientChannelID: nextClientChannelID } = {} } = nextActivity;
  let found;

  state = state.map(activity => {
    const { channelData: { clientChannelID } = {} } = activity;

    if (clientChannelID === nextClientChannelID) {
      found = true;

      return nextActivity;
    } else {
      return activity;
    }
  });

  if (!found) {
    state = [...state, nextActivity];
  }

  return state;
}

export default function (state = DEFAULT_STATE, { meta, payload, type }) {
  switch (type) {
    case RECEIVE_ACTIVITY:
      state = handleReceiveActivity(state, payload.activity);

      break;

    case POST_ACTIVITY_PENDING:
      state = [
        ...state,
        updateIn(meta.activity, ['channelData', 'state'], () => 'sending')
      ];

      break;

    case POST_ACTIVITY_REJECTED:
      state = updateActivity(
        state,
        meta.clientActivityID,
        activity => updateIn(activity, ['channelData', 'state'], () => 'send failed')
      );

      break;

    case POST_ACTIVITY_FULFILLED:
      state = updateActivity(
        state,
        meta.clientActivityID,
        // We will replace the activity with the version from the server
        () => updateIn(payload.activity, ['channelData', 'state'], () => 'sent')
      );

      break;

    default: break;
  }

  return state;
}
