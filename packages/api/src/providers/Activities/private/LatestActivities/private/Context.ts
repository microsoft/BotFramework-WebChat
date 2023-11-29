import { createContext } from 'react';
import { type WebChatActivity } from 'botframework-webchat-core';

type ContextType = {
  latestActivitiesState: readonly [readonly Readonly<WebChatActivity>[]];
};

const Context = createContext<ContextType>(
  new Proxy(
    {},
    {
      get() {
        throw new Error(`Cannot use the context before initializing it.`);
      }
    }
  ) as ContextType
);

export default Context;
