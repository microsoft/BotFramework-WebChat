import type { InternalNativeAPI, NativeAPI } from 'botframework-webchat-core';
import { createContext, useContext } from 'react';

type NativeAPIContextType = {
  readonly internalNativeAPIState: readonly [InternalNativeAPI];
  readonly nativeAPIState: readonly [NativeAPI];
};

const NativeAPIContext = createContext<NativeAPIContextType>(
  new Proxy({} as NativeAPIContextType, {
    get() {
      throw new Error('botframework-webchat: Cannot call this hook outside of <NativeAPIComposer>');
    }
  })
);

function useNativeAPIContext(): NativeAPIContextType {
  return useContext(NativeAPIContext);
}

export default NativeAPIContext;
export { useNativeAPIContext, type NativeAPIContextType };
