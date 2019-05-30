import { CONNECTION_STATUS_UPDATE } from '../actions/connectionStatusUpdate';

const DEFAULT_STATE = 0;

export default function readyState(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case CONNECTION_STATUS_UPDATE:
      state = payload.connectionStatus;
      break;

    default:
      break;
  }

  return state;
}
