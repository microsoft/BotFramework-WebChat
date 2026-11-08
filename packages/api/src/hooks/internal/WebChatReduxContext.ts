import type { createStore } from 'botframework-webchat-core';
import { createContext, useContext } from 'react';

type WebChatReduxStore = ReturnType<typeof createStore>;

type WebChatReduxContextType = {
  readonly store: WebChatReduxStore;
  /** Subscribes to the store through one store subscription, which notifies every listener in one batch. */
  readonly subscribe: (listener: () => void) => () => void;
};

/**
 * The Redux store of <Composer>. Only the Redux providers (`providers/redux/*`) read it: hooks read domain contexts.
 */
const context = createContext<WebChatReduxContextType | undefined>(undefined);

context.displayName = 'WebChatReduxContext';

function useWebChatReduxContext(): WebChatReduxContextType {
  const value = useContext(context);

  if (!value) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return value;
}

function useStore(): WebChatReduxStore {
  return useWebChatReduxContext().store;
}

function useDispatch(): WebChatReduxStore['dispatch'] {
  return useStore().dispatch;
}

export default context;

export { useDispatch, useStore, useWebChatReduxContext, type WebChatReduxContextType, type WebChatReduxStore };
