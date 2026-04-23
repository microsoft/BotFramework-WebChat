import { createContext, useContext } from 'react';

// Smaller context for lesser chance of update.
type ActivitySendStatusSubContextType = {
  readonly isSendingState: readonly [boolean];
};

const ActivitySendStatusSubContext = createContext<ActivitySendStatusSubContextType>(
  new Proxy({} as ActivitySendStatusSubContextType, {
    get() {
      throw new Error('botframework-webchat internal: This hook can only be used under <ActivitySendStatusComposer>.');
    }
  })
);

function useActivitySendStatusSubContext(): ActivitySendStatusSubContextType {
  return useContext(ActivitySendStatusSubContext);
}

export default ActivitySendStatusSubContext;

export { useActivitySendStatusSubContext, type ActivitySendStatusSubContextType };
