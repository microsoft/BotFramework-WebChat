import { SET_SUGGESTED_ACTIONS } from '../actions/setSuggestedActions';

const DEFAULT_STATE = [];

export default function suggestedActions(state = DEFAULT_STATE, { payload = {}, type }) {
  switch (type) {
    case SET_SUGGESTED_ACTIONS:
      state = [].slice.call(payload.suggestedActions || []);
      break;

    default:
      break;
  }

  return state;
}
