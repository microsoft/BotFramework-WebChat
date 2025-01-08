import { type DirectLineCardAction } from '../types/external/DirectLineCardAction';
import { type WebChatActivity } from '../types/WebChatActivity';

const EMPTY_ARRAY: readonly DirectLineCardAction[] = Object.freeze([]);

const SET_SUGGESTED_ACTIONS = 'WEB_CHAT/SET_SUGGESTED_ACTIONS' as const;

export default function setSuggestedActions(
  suggestedActions: readonly DirectLineCardAction[] = EMPTY_ARRAY,
  originActivity: undefined | WebChatActivity = undefined
) {
  return {
    type: SET_SUGGESTED_ACTIONS,
    payload: { originActivity, suggestedActions }
  };
}

export { SET_SUGGESTED_ACTIONS };
