import updateIn from 'simple-update-in';

import { RECEIVE_ACTIVITY } from '../Actions/receiveActivity';

const DEFAULT_STATE = [];

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case RECEIVE_ACTIVITY:
      state = [...state, payload.activity];
      break;

    default: break;
  }

  return state;
}
