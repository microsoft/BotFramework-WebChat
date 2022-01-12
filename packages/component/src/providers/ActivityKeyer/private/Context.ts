import { createContext } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';

type ActivityKeyerContextType = {
  getActivityByKey: (key: string) => DirectLineActivity;
  getKeyByActivity: (activity: DirectLineActivity) => string;
};

export default createContext<ActivityKeyerContextType>(undefined);

export type { ActivityKeyerContextType };
