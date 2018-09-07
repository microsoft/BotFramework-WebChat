const SET_REFERENCE_GRAMMAR_ID = 'SETTINGS/SET_REFERENCE_GRAMMAR_ID';

export default function setReferenceGrammarId(referenceGrammarId) {
  return {
    type: SET_REFERENCE_GRAMMAR_ID,
    payload: { referenceGrammarId }
  };
}

export { SET_REFERENCE_GRAMMAR_ID }
