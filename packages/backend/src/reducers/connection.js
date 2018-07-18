import updateIn from 'simple-update-in';

import { CONNECTION_STATUS_UPDATE } from '../Actions/connectionStatusUpdate';

const DEFAULT_STATE = {
  readyState: 0
};

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case CONNECTION_STATUS_UPDATE:
      state = updateIn(state, ['readyState'], () => payload.readyState)
      break;

    default: break;
  }

  return state;
}
