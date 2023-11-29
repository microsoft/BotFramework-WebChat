import { createContext } from 'react';
import { type WebChatActivity } from 'botframework-webchat-core';

import { type ActivityKey } from '../../../../../types/ActivityKey';

type ActivityKeyerContextType = {
  activityKeysState: readonly [readonly ActivityKey[]];
  getActivitiesByKey: (key?: ActivityKey) => readonly WebChatActivity[];
  getKeyByActivity: (activity?: WebChatActivity) => ActivityKey | undefined;
  getKeyByActivityId: (activityId?: string) => ActivityKey | undefined;
};

const context = createContext<ActivityKeyerContextType>(
  new Proxy({} as ActivityKeyerContextType, {
    get() {
      throw new Error(`This hook can only be used under <ActivityKeyerComposer>.`);
    }
  })
);

export default context;

export type { ActivityKeyerContextType };
