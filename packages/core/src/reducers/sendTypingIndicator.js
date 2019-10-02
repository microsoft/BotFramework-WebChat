import { SET_SEND_TYPING } from '../actions/setSendTyping';
import { SET_SEND_TYPING_INDICATOR } from '../actions/setSendTypingIndicator';

const DEFAULT_STATE = false;

export default function sendTypingIndicator(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    // TODO: [P3] Take this deprecation code out when releasing on or after 2020 January 13
    case SET_SEND_TYPING:
      console.warn(
        'Web Chat: "sendTyping" has been renamed to "sendTypingIndicator". Please use "sendTypingIndicator" instead. This deprecation migration will be removed on or after January 13 2020.'
      );
      state = payload.sendTyping;
      break;

    case SET_SEND_TYPING_INDICATOR:
      state = payload.sendTypingIndicator;
      break;

    default:
      break;
  }

  return state;
}
