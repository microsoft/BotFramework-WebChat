import { createContext } from 'react';

import type { ActivityWithRenderer, ReadonlyActivityTree } from './types';

type ActivityTreeContextType = {
  activityTreeWithRendererState: readonly [ReadonlyActivityTree];
  flattenedActivityTreeWithRendererState: readonly [readonly ActivityWithRenderer[]];
};

export default createContext<ActivityTreeContextType>(undefined);

export type { ActivityTreeContextType };
