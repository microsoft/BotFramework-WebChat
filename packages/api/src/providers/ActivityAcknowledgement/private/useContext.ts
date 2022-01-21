import { useContext } from 'react';

import ActivityAcknowledgementContext from './Context';

import type { ActivityAcknowledgementContextType } from './Context';

export default function useActivityAcknowledgementContext(
  thrownOnUndefined = true
): ActivityAcknowledgementContextType {
  const contextValue = useContext(ActivityAcknowledgementContext);

  if (thrownOnUndefined && !contextValue) {
    throw new Error(
      'botframework-webchat internal: This hook can only be used under <ActivityAcknowledgementContext>.'
    );
  }

  return contextValue;
}
