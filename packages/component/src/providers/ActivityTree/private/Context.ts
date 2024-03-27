import { createContext } from 'react';

import { type ActivityWithRenderer, type ReadonlyActivityTree } from './types';

type ActivityTreeContextType = {
  activityTreeWithRendererState: readonly [ReadonlyActivityTree];
  flattenedActivityTreeWithRendererState: readonly [readonly ActivityWithRenderer[]];
};

export default createContext<ActivityTreeContextType>(undefined);

export type { ActivityTreeContextType };
