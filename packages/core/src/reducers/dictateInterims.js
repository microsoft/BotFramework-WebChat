import { SET_DICTATE_INTERIMS } from '../actions/setDictateInterims';

const DEFAULT_STATE = [];

export default function dictateInterims(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DICTATE_INTERIMS:
      state = payload.dictateInterims;
      break;

    default:
      break;
  }

  return state;
}
