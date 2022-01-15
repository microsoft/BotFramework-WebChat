import { createContext } from 'react';

import type { ReadonlyActivityTree } from './types';

type ActivityTreeContextType = {
  activityTreeWithRendererState: readonly [ReadonlyActivityTree];
  orderedActivityKeys: readonly [readonly string[]];
};

export default createContext<ActivityTreeContextType>(undefined);

export type { ActivityTreeContextType };
