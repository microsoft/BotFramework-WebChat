import DirectLineActivity from './external/DirectLineActivity';
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
