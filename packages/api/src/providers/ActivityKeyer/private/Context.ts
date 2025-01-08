import { type WebChatActivity } from 'botframework-webchat-core';
import { createContext } from 'react';

type ActivityKeyerContextType = {
  activityKeysState: readonly [readonly string[]];
  getActivitiesByKey: (key?: string) => readonly WebChatActivity[] | undefined;
  getActivityByKey: (key?: string) => undefined | WebChatActivity;
  getKeyByActivity: (activity?: WebChatActivity) => string | undefined;
  getKeyByActivityId: (activityKey?: string) => string | undefined;
};

export default createContext<ActivityKeyerContextType>(undefined);

export type { ActivityKeyerContextType };
