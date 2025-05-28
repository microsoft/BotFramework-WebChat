import { parse } from 'valibot';
import {
  SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW,
  setSuggestedActionsOriginActivityRawActionSchema
} from '../internal/actions/setSuggestedActionsOriginActivityRaw';
import { type WebChatActivity } from '../types/WebChatActivity';

const DEFAULT_STATE = Object.freeze({ activity: undefined });

export default function suggestedActionsOriginActivity(
  state = DEFAULT_STATE,
  action
): Readonly<{
  activity: WebChatActivity | undefined;
}> {
  if (action.type === SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW) {
    state = Object.freeze({
      activity: parse(setSuggestedActionsOriginActivityRawActionSchema, action).payload.originActivity
    });
  }

  return state;
}
