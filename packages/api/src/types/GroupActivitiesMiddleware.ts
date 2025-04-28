import type { WebChatActivity } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

type GroupActivities = CallFunction<
  [Readonly<{ activities: readonly WebChatActivity[] }>],
  {
    sender: GroupedActivities;
    status: GroupedActivities;
    [others: string]: GroupedActivities;
  }
>;

type GroupActivitiesMiddleware = FunctionMiddleware<
  [],
  [Readonly<{ activities: readonly WebChatActivity[] }>],
  {
    sender: GroupedActivities;
    status: GroupedActivities;
    [others: string]: GroupedActivities;
  }
>;

export default GroupActivitiesMiddleware;

export { GroupActivities };
