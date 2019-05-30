import { SET_SEND_BOX } from '../actions/setSendBox';

const DEFAULT_STATE = '';

export default function sendBoxValue(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_SEND_BOX:
      state = payload.text;
      break;

    default:
      break;
  }

  return state;
}
