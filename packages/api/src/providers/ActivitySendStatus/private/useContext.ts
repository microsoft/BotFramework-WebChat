import { useContext } from 'react';

import ActivityStatusContext from './Context';

import type { ActivityStatusContextType } from './Context';

export default function useActivityStatusContext(thrownOnUndefined = true): ActivityStatusContextType {
  const contextValue = useContext(ActivityStatusContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <ActivityStatusComposer>.');
  }

  return contextValue;
}
