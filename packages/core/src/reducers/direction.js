import { SET_LANGUAGE } from '../actions/setLanguage';

const DEFAULT_STATE = 'ltr';

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_LANGUAGE:
      state = /^he(-IL)?$/i.test(payload.language) ? 'rtl' : 'ltr';
      break;

    default: break;
  }

  return state;
}
