import { SET_ENABLE_STREAMING } from '../actions/setEnableStreaming';

const DEFAULT_STATE = false;

export default function enableStreaming(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_ENABLE_STREAMING:
      state = payload.enableStreaming;
      break;

    default:
      break;
  }

  return state;
}
