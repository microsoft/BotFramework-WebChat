import { createContext } from 'react';

import { type ConnectionDetails } from '../ConnectionDetails';

type WhileConnectedContextType = Readonly<{
  useConnectionDetails(): readonly [ConnectionDetails | undefined];
}>;

const WhileConnectedContext = createContext<WhileConnectedContextType>(
  new Proxy({} as WhileConnectedContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only be used under <WhileConnectedContext>');
    }
  })
);

export default WhileConnectedContext;
export { type WhileConnectedContextType };
