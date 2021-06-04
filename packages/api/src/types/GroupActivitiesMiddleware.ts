import DirectLineActivity from './DirectLineActivity';

type GroupActivitiesMiddleware = () => () => ({
  activities
}: {
  activities: DirectLineActivity[];
}) => {
  sender: DirectLineActivity[][];
  status: DirectLineActivity[][];
};

export default GroupActivitiesMiddleware;
