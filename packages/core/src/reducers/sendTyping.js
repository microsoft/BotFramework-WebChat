import { SET_SEND_TYPING } from '../actions/setSendTyping';

const DEFAULT_STATE = false;

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_SEND_TYPING:
      state = payload.sendTyping;
      break;

    default: break;
  }

  return state;
}
