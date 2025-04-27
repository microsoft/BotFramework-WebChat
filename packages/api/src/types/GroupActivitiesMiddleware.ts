import type { WebChatActivity } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type GroupActivities = CallFunction<
  [Readonly<{ activities: readonly WebChatActivity[] }>],
  {
    sender: readonly (readonly WebChatActivity[])[];
    status: readonly (readonly WebChatActivity[])[];
  }
>;

type GroupActivitiesMiddleware = FunctionMiddleware<
  [],
  [Readonly<{ activities: readonly WebChatActivity[] }>],
  {
    sender: readonly (readonly WebChatActivity[])[];
    status: readonly (readonly WebChatActivity[])[];
  }
>;

export default GroupActivitiesMiddleware;

export { GroupActivities };
