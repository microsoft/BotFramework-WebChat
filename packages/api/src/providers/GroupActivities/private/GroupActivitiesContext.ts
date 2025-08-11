import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type GroupActivitiesContextType = {
  groupActivities: (options: { activities: readonly WebChatActivity[] }) => Readonly<{
    [key: string]: readonly (readonly WebChatActivity[])[];
  }>;
  groupActivitiesByName: (
    activities: readonly WebChatActivity[],
    groupingName: string
  ) => readonly (readonly WebChatActivity[])[];
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
