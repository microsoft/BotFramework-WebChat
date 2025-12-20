import type { RootDebugAPI } from 'botframework-webchat-core/internal';
import { createContext, useContext } from 'react';

type DebugAPIContextType = {
  readonly rootDebugAPIState: readonly [RootDebugAPI];
};

const DebugAPIContext = createContext<DebugAPIContextType>(
  new Proxy({} as DebugAPIContextType, {
    get() {
      throw new Error('botframework-webchat: Cannot call this hook outside of <DebugAPIComposer>');
    }
  })
);

function useDebugAPIContext(): DebugAPIContextType {
  return useContext(DebugAPIContext);
}

export default DebugAPIContext;
export { useDebugAPIContext, type DebugAPIContextType };
