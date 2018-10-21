import { SET_DICTATE_STATE } from '../actions/setDictateState';
import { IDLE } from '../constants/DictateState';

const DEFAULT_STATE = IDLE;

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DICTATE_STATE:
      state = payload.dictateState;
      break;

    default: break;
  }

  return state;
}
