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
  ['FULFILLED', 'IMPEDED', 'PENDING'],
  pipe(object({ activity: custom<WebChatActivity>(() => true) }), readonly()),
  pipe(object({ clientActivityID: string(), method: string() }), readonly())
);

const POST_ACTIVITY_FULFILLED = middlewareActionSchemas.FULFILLED.name;
const POST_ACTIVITY_IMPEDED = middlewareActionSchemas.IMPEDED.name;
const POST_ACTIVITY_PENDING = middlewareActionSchemas.PENDING.name;
const POST_ACTIVITY_REJECTED = middlewareActionSchemas.REJECTED.name;

const postActivityFulfilledActionSchema = middlewareActionSchemas.FULFILLED.schema;
const postActivityImpededActionSchema = middlewareActionSchemas.IMPEDED.schema;
const postActivityPendingActionSchema = middlewareActionSchemas.PENDING.schema;
const postActivityRejectedActionSchema = middlewareActionSchemas.REJECTED.schema;

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
