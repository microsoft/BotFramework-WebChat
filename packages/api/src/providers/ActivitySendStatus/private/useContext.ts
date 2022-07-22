import { useContext } from 'react';

import ActivitySendStatusContext from './Context';

import type { ActivitySendStatusContextType } from './Context';

export default function useActivitySendStatusContext(thrownOnUndefined = true): ActivitySendStatusContextType {
  const contextValue = useContext(ActivitySendStatusContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <ActivitySendStatusComposer>.');
  }

  return contextValue;
}
