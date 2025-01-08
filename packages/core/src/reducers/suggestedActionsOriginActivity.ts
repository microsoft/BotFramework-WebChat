import type clearSuggestedActions from '../actions/clearSuggestedActions';
import { CLEAR_SUGGESTED_ACTIONS } from '../actions/clearSuggestedActions';
import type setSuggestedActions from '../actions/setSuggestedActions';
import { SET_SUGGESTED_ACTIONS } from '../actions/setSuggestedActions';
import { type WebChatActivity } from '../types/WebChatActivity';

type ClearSuggestedActions = ReturnType<typeof clearSuggestedActions>;
type SetSuggestedActions = ReturnType<typeof setSuggestedActions>;
type State = Readonly<{ activity: undefined | WebChatActivity }>;

const DEFAULT_STATE: State = Object.freeze({ activity: undefined });

export default function suggestedActionsOriginActivity(
  state = DEFAULT_STATE,
  action: ClearSuggestedActions | SetSuggestedActions
): State {
  switch (action.type) {
    case SET_SUGGESTED_ACTIONS:
      state = { activity: action.payload.originActivity };

      break;

    case CLEAR_SUGGESTED_ACTIONS:
      state = DEFAULT_STATE;

      break;

    default:
      break;
  }

  return state;
}
