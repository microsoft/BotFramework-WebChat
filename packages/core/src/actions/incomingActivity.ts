import type { DirectLineActivity } from '../types/external/DirectLineActivity';

type IncomingActivityActionType = 'DIRECT_LINE/INCOMING_ACTIVITY';

type IncomingActivityAction = {
  payload: { activity: DirectLineActivity };
  type: IncomingActivityActionType;
};

const INCOMING_ACTIVITY: IncomingActivityActionType = 'DIRECT_LINE/INCOMING_ACTIVITY';

function incomingActivity(activity: DirectLineActivity): IncomingActivityAction {
  return {
    type: INCOMING_ACTIVITY,
    payload: { activity }
  };
}

export default incomingActivity;
export { INCOMING_ACTIVITY };
export type { IncomingActivityAction };
