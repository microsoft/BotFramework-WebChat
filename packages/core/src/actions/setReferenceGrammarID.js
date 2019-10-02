const SET_REFERENCE_GRAMMAR_ID = 'WEB_CHAT/SET_REFERENCE_GRAMMAR_ID';

export default function setReferenceGrammarID(referenceGrammarID) {
  return {
    type: SET_REFERENCE_GRAMMAR_ID,
    payload: { referenceGrammarID }
  };
}

export { SET_REFERENCE_GRAMMAR_ID };
