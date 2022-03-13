import type { DirectLineActivity } from 'botframework-webchat-core';

import FunctionMiddleware, { CallFunction } from './FunctionMiddleware';

type GroupActivities = CallFunction<
  [{ activities: DirectLineActivity[] }],
  {
    sender: DirectLineActivity[][];
    status: DirectLineActivity[][];
  }
>;

type GroupActivitiesMiddleware = FunctionMiddleware<
  [],
  [{ activities: DirectLineActivity[] }],
  {
    sender: DirectLineActivity[][];
    status: DirectLineActivity[][];
  }
>;

export default GroupActivitiesMiddleware;

export { GroupActivities };
