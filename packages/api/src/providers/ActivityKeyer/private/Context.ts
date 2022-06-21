import { createContext } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

type ActivityKeyerContextType = {
  activityKeysState: readonly [readonly string[]];
  getActivityByKey: (key?: string) => undefined | WebChatActivity;
  getKeyByActivity: (activity?: WebChatActivity) => string | undefined;
  getKeyByActivityId: (activityKey?: string) => string | undefined;
};

export default createContext<ActivityKeyerContextType>(undefined);

export type { ActivityKeyerContextType };
