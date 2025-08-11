import { createContext, useContext as reactUseContext, type Context } from 'react';

export default function createContextAndHook<T extends object>(
  displayName: string
): Readonly<{
  contextComponentType: Context<T>;
  useContext: () => T;
}> {
  const contextComponentType = createContext<T>(
    new Proxy({} as T, {
      get() {
        throw new Error(`botframework-webchat: This hook can only be used under <${displayName}>`);
      }
    })
  );

  contextComponentType.displayName = displayName;

  return {
    contextComponentType,
    useContext: (): T => reactUseContext(contextComponentType)
  };
}
