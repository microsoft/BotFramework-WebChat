import { createContext } from 'react';

import type CustomElementPortalRegistry from './CustomElementPortalRegistry';

export type CustomElementsContextType = Readonly<{
  codeBlockTagName: string;
  codeBlockCopyButtonTagName: string;
  portalRegistry: CustomElementPortalRegistry;
}>;

const CustomElementsContext = createContext<CustomElementsContextType>(
  new Proxy({} as CustomElementsContextType, {
    get() {
      throw new Error('botframework-webchat: Cannot use this hook outside of <CustomElementsComposer>.');
    }
  })
);

CustomElementsContext.displayName = 'CustomElementsContext';

export default CustomElementsContext;
