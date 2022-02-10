import { createContext } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';

type ActivityKeyerContextType = {
  activityKeysState: readonly [readonly string[]];
  getActivityByKey: (key?: string) => DirectLineActivity | undefined;
  getKeyByActivity: (activity?: DirectLineActivity) => string | undefined;
  getKeyByActivityId: (activityKey?: string) => string | undefined;
};

export default createContext<ActivityKeyerContextType>(undefined);

export type { ActivityKeyerContextType };
