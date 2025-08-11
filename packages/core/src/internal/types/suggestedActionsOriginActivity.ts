import { custom, object, pipe, readonly, undefinedable, type InferOutput } from 'valibot';

// TODO: Resolve possibly cyclic dependency by moving `types` into a separate package.
// import { type WebChatActivity } from '../../types/WebChatActivity';

const suggestedActionsOriginActivityStateSchema = pipe(
  object({
    // activity: undefinedable(custom<WebChatActivity>(() => true))
    activity: undefinedable(custom<any>(() => true))
  }),
  readonly()
);

type SuggestedActionsOriginActivityState = InferOutput<typeof suggestedActionsOriginActivityStateSchema>;

export { suggestedActionsOriginActivityStateSchema, type SuggestedActionsOriginActivityState };
