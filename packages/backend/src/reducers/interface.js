import updateIn from 'simple-update-in';

import { SET_LANGUAGE } from '../Actions/setLanguage';

const DEFAULT_STATE = {
  language: 'en-US'
};

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_LANGUAGE:
      state = updateIn(state, ['language'], () => payload.language);
      break;

    default: break;
  }

  return state;
}
