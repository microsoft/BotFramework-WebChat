import { createContext } from 'react';

import type { StaticElement, StaticElementEntry } from './types';

type LiveRegionTwinContextType = {
  markAllAsRendered: () => void;
  queueStaticElement: (element: StaticElement) => void;
  staticElementEntriesState: readonly [readonly StaticElementEntry[]];
};

const LiveRegionTwinContext = createContext<LiveRegionTwinContextType>(undefined);

export default LiveRegionTwinContext;

export type { LiveRegionTwinContextType };
