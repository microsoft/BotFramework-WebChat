import { SET_LANGUAGE } from '../actions/setLanguage';

const DEFAULT_STATE = 'en-US';

export default function language(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_LANGUAGE:
      state = payload.language;
      break;

    default:
      break;
  }

  return state;
}
