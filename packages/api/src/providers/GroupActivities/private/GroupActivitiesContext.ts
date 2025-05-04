import { createContext } from 'react';
import { type GroupActivities } from '../../../types/GroupActivitiesMiddleware';

type GroupActivitiesContextType = {
  groupActivities: GroupActivities;
};

const GroupActivitiesContext = createContext<GroupActivitiesContextType>(
  new Proxy({} as GroupActivitiesContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <GroupActivitiesContext>');
    }
  })
);

export default GroupActivitiesContext;
export { type GroupActivitiesContextType };
