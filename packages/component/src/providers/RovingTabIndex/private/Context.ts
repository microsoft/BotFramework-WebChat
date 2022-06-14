import { createContext } from 'react';

import type { MutableRefObject } from 'react';

type RovingTabIndexContextType = {
  itemEffector: <T extends HTMLElement>(ref: MutableRefObject<T>, index: number) => () => void;
};

const RovingTabIndexContext = createContext<RovingTabIndexContextType>({
  itemEffector: () => {
    // This will be implemented when using in <RovingTabIndexComposer>.
    // We have a check over there to make sure we did implement it.
    throw new Error('botframework-webchat internal: Not implemented.');
  }
});

export default RovingTabIndexContext;

export type { RovingTabIndexContextType };
