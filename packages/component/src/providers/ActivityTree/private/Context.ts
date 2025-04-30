import { createContext } from 'react';

import type { ActivityWithRenderer, ReadonlyActivityTree } from './types';

type ActivityTreeContextType = {
  activitiesWithRenderer: readonly ActivityWithRenderer[];
  activityTreeWithRendererState: readonly [ReadonlyActivityTree];
  flattenedActivityTreeWithRendererState: readonly [readonly ActivityWithRenderer[]];
  renderingActivityKeysState: readonly [readonly string[]];
};

export default createContext<ActivityTreeContextType>(undefined);

export type { ActivityTreeContextType };
