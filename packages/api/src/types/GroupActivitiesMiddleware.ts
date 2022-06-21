import type { WebChatActivity } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type GroupActivities = CallFunction<
  [{ activities: WebChatActivity[] }],
  {
    sender: WebChatActivity[][];
    status: WebChatActivity[][];
  }
>;

type GroupActivitiesMiddleware = FunctionMiddleware<
  [],
  [{ activities: WebChatActivity[] }],
  {
    sender: WebChatActivity[][];
    status: WebChatActivity[][];
  }
>;

export default GroupActivitiesMiddleware;

export { GroupActivities };
