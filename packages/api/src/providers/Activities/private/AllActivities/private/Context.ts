import { createContext } from 'react';

import { type WebChatActivity } from 'botframework-webchat-core';

type ActivitiesComposerContextType = {
  activitiesState: readonly [readonly Readonly<WebChatActivity>[]];
  // recentTypingActivitiesState: readonly [ReadonlyMap<string, Readonly<WebChatActivity>>];
};

const defaultContext = Object.create(
  new Proxy(
    {},
    {
      get() {
        throw new Error('botframework-webchat: this context is only accessible under <ActivitiesComposer>.');
      }
    }
  ) as ActivitiesComposerContextType
);

const ActivitiesComposerContext = createContext<ActivitiesComposerContextType>(defaultContext);

export default ActivitiesComposerContext;

export type { ActivitiesComposerContextType };
