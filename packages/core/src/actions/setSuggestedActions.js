const EMPTY_ARRAY = [];

const SET_SUGGESTED_ACTIONS = 'SUGGESTED_ACTIONS/SET';

export default function setSuggestedActions(suggestedActions = EMPTY_ARRAY) {
  return {
    type: SET_SUGGESTED_ACTIONS,
    payload: { suggestedActions }
  };
}

export { SET_SUGGESTED_ACTIONS }
