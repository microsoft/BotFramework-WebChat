import { useContext } from 'react';

import ActivityTreeContext from './Context';

import type { ActivityTreeContextType } from './Context';

export default function useActivityTreeContext(thrownOnUndefined = true): ActivityTreeContextType {
  const contextValue = useContext(ActivityTreeContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <ActivityTreeComposer>.');
  }

  return contextValue;
}
