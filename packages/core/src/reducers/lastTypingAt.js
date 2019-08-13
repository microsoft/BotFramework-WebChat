import { INCOMING_ACTIVITY } from '../actions/incomingActivity';

const DEFAULT_STATE = {};

export default function lastTypingAt(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case INCOMING_ACTIVITY:
      const {
        activity: {
          from: { id, role },
          type: activityType
        }
      } = payload;
      if (role === 'bot') {
        if (activityType === 'typing') {
          state = { ...state, [id]: Date.now() };
        } else if (activityType === 'message') {
          const { [id]: last, ...rest } = state;
          state = rest;
        }
      }
      break;

    default:
      break;
  }

  return state;
}
