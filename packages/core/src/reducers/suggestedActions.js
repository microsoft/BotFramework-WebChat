import { CLEAR_SUGGESTED_ACTIONS } from '../actions/clearSuggestedActions';
import { SET_SUGGESTED_ACTIONS } from '../actions/setSuggestedActions';

const DEFAULT_STATE = [];

export default function suggestedActions(state = DEFAULT_STATE, { payload = {}, type }) {
  switch (type) {
    case SET_SUGGESTED_ACTIONS:
      state = [].slice.call(payload.suggestedActions || []);
      break;
    case CLEAR_SUGGESTED_ACTIONS:
      state = DEFAULT_STATE;
      break;
    default:
      break;
  }

  return state;
}
