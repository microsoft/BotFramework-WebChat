import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

export type ActivityListenerContextType = {
  upsertedActivitiesState: readonly [readonly WebChatActivity[]];
};

const ActivityListenerContext = createContext<ActivityListenerContextType>(
  new Proxy({} as ActivityListenerContextType, {
    get() {
      throw new Error('botframework-webchat internal: This hook can only used under <ActivityListenerComposer>.');
    }
  })
);

export default ActivityListenerContext;
