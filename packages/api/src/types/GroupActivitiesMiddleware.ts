import DirectLineActivity from './external/DirectLineActivity';

type GroupActivities = ({
  activities
}: {
  activities: DirectLineActivity[];
}) => {
  sender: DirectLineActivity[][];
  status: DirectLineActivity[][];
};

type GroupActivitiesEnhancer = (next: GroupActivities) => GroupActivities;
type GroupActivitiesMiddleware = () => GroupActivitiesEnhancer;

export default GroupActivitiesMiddleware;
