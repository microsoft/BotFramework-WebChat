import { createContext } from 'react';

export type CustomElementsContextType = Readonly<{ codeBlockCopyButtonTagName: string }>;

const CustomElementsContext = createContext<CustomElementsContextType>(
  new Proxy({} as CustomElementsContextType, {
    get() {
      throw new Error('botframework-webchat: Cannot use this hook outside of <CustomElementsComposer>.');
    }
  })
);

CustomElementsContext.displayName = 'CustomElementsContext';

export default CustomElementsContext;
