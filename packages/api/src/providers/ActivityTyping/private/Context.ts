import { createContext } from 'react';
import { type Typing } from '../types/Typing';

export type ActivityTypingContextType = {
  allTypingState: readonly [ReadonlyMap<string, Typing>];
};

const ActivityTypingContext = createContext<ActivityTypingContextType>(
  new Proxy({} as ActivityTypingContextType, {
    get() {
      throw new Error('botframework-webchat internal: This hook can only be used under <ActivityTypingProvider>.');
    }
  })
);

export default ActivityTypingContext;
