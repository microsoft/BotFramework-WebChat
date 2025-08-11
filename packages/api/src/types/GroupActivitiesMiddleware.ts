import type { WebChatActivity } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type GroupedActivities = readonly (readonly WebChatActivity[])[];

type GroupActivities = CallFunction<
  [Readonly<{ activities: readonly WebChatActivity[] }>],
  { [key: string]: GroupedActivities }
>;

type GroupActivitiesMiddleware = FunctionMiddleware<
  [string],
  [Readonly<{ activities: readonly WebChatActivity[] }>],
  { [key: string]: GroupedActivities }
>;

export default GroupActivitiesMiddleware;

export { GroupActivities };
