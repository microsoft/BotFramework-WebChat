import {
  CONNECT_FULFILLED,
  CONNECT_PENDING,
  CONNECT_REJECTED,
  CONNECT_STILL_PENDING
} from '../actions/connect';

import { DISCONNECT_FULFILLED } from '../../lib/actions/disconnect';

const DEFAULT_STATE = 'notconnected';

export default function(state = DEFAULT_STATE, { type }) {
  switch(type) {
    case CONNECT_PENDING:
      state = 'connecting';
      break;

    case CONNECT_FULFILLED:
      state = 'connected';
      break;

    case CONNECT_REJECTED:
      state = 'error';
      break;

    case CONNECT_STILL_PENDING:
      state = 'connectingslow';
      break;

    case DISCONNECT_FULFILLED:
      state = 'notconnected';
      break;

    default: break;
  }
  return state;
}
