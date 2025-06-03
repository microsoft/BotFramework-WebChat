import { custom, literal, object, pipe, readonly, string, type InferOutput } from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';
import createMiddlewareActionSchemas from './private/createMiddlewareActionSchemas';

const POST_ACTIVITY = 'DIRECT_LINE/POST_ACTIVITY';

const postActivityActionSchema = pipe(
  object({
    meta: pipe(object({ method: string() }), readonly()),
    payload: pipe(object({ activity: custom<WebChatActivity>(() => true) }), readonly()),
    type: literal(POST_ACTIVITY)
  }),
  readonly()
);

const middlewareActionSchemas = createMiddlewareActionSchemas(
  POST_ACTIVITY,
  pipe(object({ activity: custom<WebChatActivity>(() => true) }), readonly()),
  pipe(object({ clientActivityID: string(), method: string() }), readonly())
);

const POST_ACTIVITY_FULFILLED = middlewareActionSchemas.fulfilled.name;
const POST_ACTIVITY_IMPEDED = middlewareActionSchemas.impeded.name;
const POST_ACTIVITY_PENDING = middlewareActionSchemas.pending.name;
const POST_ACTIVITY_REJECTED = middlewareActionSchemas.rejected.name;

const postActivityFulfilledActionSchema = middlewareActionSchemas.fulfilled.schema;
const postActivityImpededActionSchema = middlewareActionSchemas.impeded.schema;
const postActivityPendingActionSchema = middlewareActionSchemas.pending.schema;
const postActivityRejectedActionSchema = middlewareActionSchemas.rejected.schema;

type PostActivityAction = InferOutput<typeof postActivityActionSchema>;
type PostActivityFulfilledAction = InferOutput<typeof postActivityFulfilledActionSchema>;
type PostActivityImpededAction = InferOutput<typeof postActivityImpededActionSchema>;
type PostActivityPendingAction = InferOutput<typeof postActivityPendingActionSchema>;
type PostActivityRejectedAction = InferOutput<typeof postActivityRejectedActionSchema>;

function postActivity(activity: WebChatActivity, method = 'keyboard'): PostActivityAction {
  return {
    type: POST_ACTIVITY,
    meta: { method },
    payload: { activity }
  };
}

export default postActivity;
export {
  POST_ACTIVITY,
  POST_ACTIVITY_FULFILLED,
  POST_ACTIVITY_IMPEDED,
  POST_ACTIVITY_PENDING,
  POST_ACTIVITY_REJECTED,
  postActivityActionSchema,
  postActivityFulfilledActionSchema,
  postActivityImpededActionSchema,
  postActivityPendingActionSchema,
  postActivityRejectedActionSchema,
  type PostActivityAction,
  type PostActivityFulfilledAction,
  type PostActivityImpededAction,
  type PostActivityPendingAction,
  type PostActivityRejectedAction
};
