import {
  CONNECT_FULFILLED,
  CONNECT_PENDING,
  CONNECT_REJECTED,
  CONNECT_STILL_PENDING,
  CONNECT_TIMEOUT_COMPLETE
} from '../actions/connect';

import { DISCONNECT_FULFILLED } from '../../lib/actions/disconnect';

const DEFAULT_STATE = {
  status: 'uninitialized',
  timeoutCompleted: false
};

export default function (state = DEFAULT_STATE, { type, meta }) {
  switch (type) {
    case CONNECT_PENDING:
      if (state.status !== 'uninitialized') {
        state = {
          ...state,
          status: 'reconnecting',
          timeoutCompleted: false
        };
      }

      break;

    case CONNECT_FULFILLED:
      state = {
        ...state,
        status: 'connected',
        timeoutCompleted: false
      };

      break;

    case CONNECT_REJECTED:
      state = {
        ...state,
        status: 'error',
        timeoutCompleted: false
      };

      break;

    case CONNECT_STILL_PENDING:
      state = {
        ...state,
        status: 'connectingslow',
        timeoutCompleted: false
      };

      break;

    case DISCONNECT_FULFILLED:
      state = {
        ...state,
        status: meta.error ? 'error' : 'notconnected',
        timeoutCompleted: false
      };

      break;

    case CONNECT_TIMEOUT_COMPLETE:
      state = {
        ...state,
        timeoutCompleted: true
      };

      break;

    default: break;
  }

  return state;
}
