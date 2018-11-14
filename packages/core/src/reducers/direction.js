import { SET_DIRECTION } from '../actions/setDirection';

const DEFAULT_STATE = 'ltr';

const DIRECTIONS = ['ltr', 'rtl'];

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DIRECTION:
      state = (DIRECTIONS.indexOf(payload.direction) !== -1) ? payload.direction : state;
      break;

    default: break;
  }

  return state;
}
