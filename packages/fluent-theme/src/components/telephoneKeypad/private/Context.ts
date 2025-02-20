import { createContext, type Dispatch, type SetStateAction } from 'react';

type ContextType = Readonly<{
  setShown: Dispatch<SetStateAction<boolean>>;
  shown: boolean;
}>;

const Context = createContext<ContextType>(
  new Proxy({} as ContextType, {
    get() {
      throw new Error('botframework-webchat: This hook can only used under its corresponding <Provider>.');
    }
  })
);

Context.displayName = 'TelephoneKeypad.Context';

export default Context;
