import type { WebChatActivity } from '../types/WebChatActivity';

type PostActivityActionType = 'DIRECT_LINE/POST_ACTIVITY';
type PostActivityFulfilledActionType = 'DIRECT_LINE/POST_ACTIVITY_FULFILLED';
type PostActivityPendingActionType = 'DIRECT_LINE/POST_ACTIVITY_PENDING';
type PostActivityRejectedActionType = 'DIRECT_LINE/POST_ACTIVITY_REJECTED';

type PostActivityAction = {
  meta: { method: string };
  payload: { activity: WebChatActivity };
  type: PostActivityActionType;
};

type PostActivityFulfilledAction = {
  meta: { clientActivityID: string; method: string };
  payload: { activity: WebChatActivity };
  type: PostActivityFulfilledActionType;
};

type PostActivityPendingAction = {
  meta: { clientActivityID: string; method: string };
  payload: { activity: WebChatActivity };
  type: PostActivityPendingActionType;
};

type PostActivityRejectedAction = {
  error: true;
  meta: { clientActivityID: string; method: string };
  payload: Error;
  type: PostActivityRejectedActionType;
};

const POST_ACTIVITY: PostActivityActionType = 'DIRECT_LINE/POST_ACTIVITY';
const POST_ACTIVITY_FULFILLED: PostActivityFulfilledActionType = `${POST_ACTIVITY}_FULFILLED`;
const POST_ACTIVITY_PENDING: PostActivityPendingActionType = `${POST_ACTIVITY}_PENDING`;
const POST_ACTIVITY_REJECTED: PostActivityRejectedActionType = `${POST_ACTIVITY}_REJECTED`;

function postActivity(activity: WebChatActivity, method = 'keyboard'): PostActivityAction {
  return {
    type: POST_ACTIVITY,
    meta: { method },
    payload: { activity }
  };
}

export default postActivity;
export { POST_ACTIVITY, POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING, POST_ACTIVITY_REJECTED };
export type { PostActivityAction, PostActivityFulfilledAction, PostActivityPendingAction, PostActivityRejectedAction };
