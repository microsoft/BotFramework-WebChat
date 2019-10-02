const EMPTY_ARRAY = [];

const SET_SUGGESTED_ACTIONS = 'WEB_CHAT/SET_SUGGESTED_ACTIONS';

export default function setSuggestedActions(suggestedActions = EMPTY_ARRAY) {
  return {
    type: SET_SUGGESTED_ACTIONS,
    payload: { suggestedActions }
  };
}

export { SET_SUGGESTED_ACTIONS };
