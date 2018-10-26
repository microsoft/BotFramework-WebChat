import { SET_REFERENCE_GRAMMAR_ID } from '../actions/setReferenceGrammarID';

const DEFAULT_STATE = null;

export default function (state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_REFERENCE_GRAMMAR_ID:
      state = payload.referenceGrammarID;
      break;

    default: break;
  }

  return state;
}
