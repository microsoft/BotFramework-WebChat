import { SET_REFERENCE_GRAMMAR_ID } from '../actions/setReferenceGrammarID';

const DEFAULT_STATE = null;

export default function referenceGrammarID(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case SET_REFERENCE_GRAMMAR_ID:
      state = payload.referenceGrammarID || null;
      break;

    default:
      break;
  }

  return state;
}
