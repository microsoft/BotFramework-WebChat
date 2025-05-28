import { array, custom, literal, object, pipe, readonly, safeParse, type InferOutput } from 'valibot';
import { type DirectLineCardAction } from '../../types/external/DirectLineCardAction';

const SET_SUGGESTED_ACTIONS_RAW = 'WEB_CHAT_INTERNAL/SET_SUGGESTED_ACTIONS_RAW' as const;

const setSuggestedActionsRawActionSchema = pipe(
  object({
    payload: pipe(
      object({
        suggestedActions: pipe(
          array(custom<DirectLineCardAction>(value => safeParse(object({}), value).success)),
          readonly()
        )
      }),
      readonly()
    ),
    type: literal(SET_SUGGESTED_ACTIONS_RAW)
  }),
  readonly()
);

type SetSuggestedActionsRawAction = InferOutput<typeof setSuggestedActionsRawActionSchema>;

export default function setSuggestedActionsRaw(
  suggestedActions: readonly DirectLineCardAction[]
): SetSuggestedActionsRawAction {
  return {
    type: SET_SUGGESTED_ACTIONS_RAW,
    payload: { suggestedActions }
  };
}

export { SET_SUGGESTED_ACTIONS_RAW, setSuggestedActionsRawActionSchema, type SetSuggestedActionsRawAction };
