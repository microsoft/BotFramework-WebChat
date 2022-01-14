import { createContext } from 'react';

import type { ReadonlyActivityTree } from './types';

type ActivityTreeContextType = {
  activityTreeWithRendererState: readonly [ReadonlyActivityTree];
};

export default createContext<ActivityTreeContextType>(undefined);

export type { ActivityTreeContextType };
