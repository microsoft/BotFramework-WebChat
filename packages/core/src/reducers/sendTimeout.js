import { SET_SEND_TIMEOUT } from '../actions/setSendTimeout';

const DEFAULT_STATE = 20000;

export default function sendTimeout(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_SEND_TIMEOUT:
      state = payload.sendTimeout;
      break;

    default:
      break;
  }

  return state;
}
