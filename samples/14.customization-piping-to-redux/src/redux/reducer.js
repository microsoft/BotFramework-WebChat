import { SET_BACKGROUND_COLOR } from './actions';

// Make a more compelling demo than just changing background color

const DEFAULT_STATE = {
  backgroundColor: 'White'
};

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_BACKGROUND_COLOR:
      state = { ...state, backgroundColor: payload.color };
      break;

    default: break;
  }

  return state;
}
