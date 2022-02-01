import { createContext } from 'react';

import type { LiveRegionElement } from './types';

type LiveRegionTwinContextType = {
  markAllAsRendered: () => void;
  queueStaticElement: (element: LiveRegionElement) => void;
  staticElementsState: readonly [readonly LiveRegionElement[]];
};

const LiveRegionTwinContext = createContext<LiveRegionTwinContextType>(undefined);

export default LiveRegionTwinContext;

export type { LiveRegionTwinContextType };
