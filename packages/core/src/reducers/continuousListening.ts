import { SET_CONTINUOUS_LISTENING } from '../actions/setContinuousListening';

const DEFAULT_STATE = false;

export default function continuousListening(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_CONTINUOUS_LISTENING:
      state = payload.continuousListening;
      break;

    default:
      break;
  }

  return state;
}
