import { custom, literal, object, optional, pipe, readonly, safeParse, type InferOutput } from 'valibot';
import { type WebChatActivity } from '../../types/WebChatActivity';

const SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW =
  'WEB_CHAT_INTERNAL/SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW' as const;

const setSuggestedActionsOriginActivityRawActionSchema = pipe(
  object({
    payload: pipe(
      object({
        originActivity: optional(custom<WebChatActivity>(value => safeParse(object({}), value).success))
      }),
      readonly()
    ),
    type: literal(SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW)
  }),
  readonly()
);

type SetSuggestedActionsOriginActivityRawAction = InferOutput<typeof setSuggestedActionsOriginActivityRawActionSchema>;

export default function setSuggestedActionsOriginActivityRaw(
  originActivity: undefined | WebChatActivity
): SetSuggestedActionsOriginActivityRawAction {
  return {
    type: SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW,
    payload: { originActivity }
  };
}

export {
  SET_SUGGESTED_ACTIONS_ORIGIN_ACTIVITY_RAW,
  setSuggestedActionsOriginActivityRawActionSchema,
  type SetSuggestedActionsOriginActivityRawAction
};
