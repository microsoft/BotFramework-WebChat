import { createContext, memo } from 'react';
import createLiveRegionTwinComposer from './createLiveRegionTwinComposer';

import type { StaticElement, StaticElementEntry } from './types';

export type LiveRegionTwinContextType = {
  markAllAsRendered: () => void;
  queueStaticElement: (element: StaticElement) => void;
  staticElementEntriesState: readonly [readonly StaticElementEntry[]];
};

export const LiveRegionTwinContext = createContext<LiveRegionTwinContextType>(
  new Proxy(
    {},
    {
      get(_target, key: string) {
        throw new Error(`LiveRegionTwinContext.${key} can only be used inside of LiveRegionTwinComposer`);
      }
    }
  ) as unknown as LiveRegionTwinContextType
);

const LiveRegionTwinComposer = memo(createLiveRegionTwinComposer(LiveRegionTwinContext));

LiveRegionTwinComposer.displayName = 'LiveRegionTwinComposer';

export default LiveRegionTwinComposer;
