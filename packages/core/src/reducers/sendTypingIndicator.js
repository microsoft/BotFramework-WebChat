import { SET_SEND_TYPING_INDICATOR } from '../actions/setSendTypingIndicator';

const DEFAULT_STATE = false;

export default function sendTypingIndicator(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_SEND_TYPING_INDICATOR:
      state = payload.sendTypingIndicator;
      break;

    default:
      break;
  }

  return state;
}
