import { createContext } from 'react';

import type { ActivityWithRenderer } from './types';

type ActivityTreeContextType = {
  activitiesWithRenderer: readonly ActivityWithRenderer[];
  renderingActivityKeysState: readonly [readonly string[]];
};

export default createContext<ActivityTreeContextType>(undefined);

export type { ActivityTreeContextType };
