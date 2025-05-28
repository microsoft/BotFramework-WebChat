import { parse } from 'valibot';
import {
  SET_SUGGESTED_ACTIONS_RAW,
  setSuggestedActionsRawActionSchema
} from '../internal/actions/setSuggestedActionsRaw';

const DEFAULT_STATE = Object.freeze([]);

export default function suggestedActions(state = DEFAULT_STATE, action) {
  // switch (type) {
  //   case SET_SUGGESTED_ACTIONS:
  //     if ((payload.suggestedActions || []).length) {
  //       state = [].slice.call(payload.suggestedActions);
  //     } else {
  //       state = DEFAULT_STATE;
  //     }
  //     break;
  //   case CLEAR_SUGGESTED_ACTIONS:
  //     state = DEFAULT_STATE;
  //     break;
  //   default:
  //     break;
  // }

  if (action.type === SET_SUGGESTED_ACTIONS_RAW) {
    state = parse(setSuggestedActionsRawActionSchema, action).payload.suggestedActions;
  }

  return state;
}
