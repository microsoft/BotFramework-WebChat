import { array, custom, literal, object, optional, pipe, readonly, safeParse, type InferOutput } from 'valibot';
import { type DirectLineCardAction } from '../types/external/DirectLineCardAction';
import { type WebChatActivity } from '../types/WebChatActivity';

const EMPTY_ARRAY: readonly DirectLineCardAction[] = Object.freeze([]);

const SET_SUGGESTED_ACTIONS = 'WEB_CHAT/SET_SUGGESTED_ACTIONS' as const;

const setSuggestedActionsActionSchema = pipe(
  object({
    payload: pipe(
      object({
        originActivity: optional(custom<WebChatActivity>(value => safeParse(object({}), value).success)),
        suggestedActions: pipe(
          array(custom<DirectLineCardAction>(value => safeParse(object({}), value).success)),
          readonly()
        )
      }),
      readonly()
    ),
    type: literal(SET_SUGGESTED_ACTIONS)
  }),
  readonly()
);

type SetSuggestedActionsAction = InferOutput<typeof setSuggestedActionsActionSchema>;

export default function setSuggestedActions(
  suggestedActions: readonly DirectLineCardAction[] = EMPTY_ARRAY,
  originActivity: undefined | WebChatActivity = undefined
): SetSuggestedActionsAction {
  return {
    type: SET_SUGGESTED_ACTIONS,
    payload: { originActivity, suggestedActions }
  };
}

export { SET_SUGGESTED_ACTIONS, setSuggestedActionsActionSchema, type SetSuggestedActionsAction };
