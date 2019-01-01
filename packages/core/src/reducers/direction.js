import { SET_DIRECTION } from '../actions/setDirection';

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_DIRECTION:
      state = payload.direction === 'rtl' ? 'rtl' : 'ltr';
      break;

    default: break;
  }

  return state;
}
