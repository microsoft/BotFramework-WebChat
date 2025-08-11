import { literal, object, pipe, readonly, type InferOutput } from 'valibot';

const CLEAR_SUGGESTED_ACTIONS = 'WEB_CHAT/CLEAR_SUGGESTED_ACTIONS' as const;

const clearSuggestedActionsActionSchema = pipe(
  object({
    type: literal(CLEAR_SUGGESTED_ACTIONS)
  }),
  readonly()
);

type ClearSuggestedActionsAction = InferOutput<typeof clearSuggestedActionsActionSchema>;

export default function clearSuggestedActions(): ClearSuggestedActionsAction {
  return {
    type: CLEAR_SUGGESTED_ACTIONS
  };
}

export { CLEAR_SUGGESTED_ACTIONS, clearSuggestedActionsActionSchema, type ClearSuggestedActionsAction };
