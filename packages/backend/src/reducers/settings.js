import updateIn from 'simple-update-in';

import { SET_LANGUAGE } from '../Actions/setLanguage';
import { SET_REFERENCE_GRAMMAR_ID } from '../Actions/setReferenceGrammarId';

const DEFAULT_STATE = {
  language: 'en-US',
  referenceGrammarId: null
};

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_LANGUAGE:
      state = updateIn(state, ['language'], () => payload.language);
      break;

    case SET_REFERENCE_GRAMMAR_ID:
      state = updateIn(state, ['referenceGrammarId'], () => payload.referenceGrammarId);
      break;

    default: break;
  }

  return state;
}
