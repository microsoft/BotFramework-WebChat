import { DICTATING, IDLE, STARTING, STOPPING } from '../constants/DictateState';

import { SET_DICTATE_STATE } from '../actions/setDictateState';
import { START_DICTATE } from '../actions/startDictate';
import { STOP_DICTATE } from '../actions/stopDictate';

const DEFAULT_STATE = IDLE;

export default function dictateState(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DICTATE_STATE:
      state = payload.dictateState;
      break;

    case START_DICTATE:
      if (state === IDLE || state === STOPPING) {
        state = STARTING;
      }

      break;

    case STOP_DICTATE:
      if (state === STARTING || state === DICTATING) {
        state = STOPPING;
      }

      break;

    default:
      break;
  }

  return state;
}
