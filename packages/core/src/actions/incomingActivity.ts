import type { WebChatActivity } from '../types/WebChatActivity';

type IncomingActivityActionType = 'DIRECT_LINE/INCOMING_ACTIVITY';

type IncomingActivityAction = {
  payload: { activity: WebChatActivity };
  type: IncomingActivityActionType;
};

const INCOMING_ACTIVITY: IncomingActivityActionType = 'DIRECT_LINE/INCOMING_ACTIVITY';

function incomingActivity(activity: WebChatActivity): IncomingActivityAction {
  return {
    type: INCOMING_ACTIVITY,
    payload: { activity }
  };
}

export default incomingActivity;
export { INCOMING_ACTIVITY };
export type { IncomingActivityAction };
