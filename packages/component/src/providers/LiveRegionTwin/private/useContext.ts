import { useContext } from 'react';

import LiveRegionTwinContext from './Context';

import type { LiveRegionTwinContextType } from './Context';

export default function useLiveRegionTwinContext(thrownOnUndefined = true): LiveRegionTwinContextType {
  const contextValue = useContext(LiveRegionTwinContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <LiveRegionComposer>.');
  }

  return contextValue;
}
