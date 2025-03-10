import { useContext } from 'react';

import { LiveRegionTwinContext, type LiveRegionTwinContextType } from './LiveRegionTwinComposer';

export default function useLiveRegionTwinContext(): LiveRegionTwinContextType {
  const contextValue = useContext(LiveRegionTwinContext);

  return contextValue;
}
