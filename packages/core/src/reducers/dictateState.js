import { IDLE } from '../constants/DictateState';

import { SET_DICTATE_STATE } from '../actions/setDictateState';
import { START_DICTATE } from '../actions/startDictate';
import { STOP_DICTATE } from '../actions/stopDictate';
import nextDictateState from '../services/private/nextDictateState';

const DEFAULT_STATE = IDLE;

export default function dictateState(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DICTATE_STATE:
      state = payload.dictateState;
      break;

    case START_DICTATE:
      state = nextDictateState(state, 'start');
      break;

    case STOP_DICTATE:
      state = nextDictateState(state, 'stop');
      break;

    default:
      break;
  }

  return state;
}
