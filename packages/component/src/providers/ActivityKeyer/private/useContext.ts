import { useContext } from 'react';

import ActivityKeyerContext from './Context';

import type { ActivityKeyerContextType } from './Context';

export default function useActivityKeyerContext(thrownOnUndefined = true): ActivityKeyerContextType {
  const contextValue = useContext(ActivityKeyerContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error('botframework-webchat internal: This hook can only be used under <ActivityKeyerComposer>.');
  }

  return contextValue;
}
