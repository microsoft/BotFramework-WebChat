import { useSyncExternalStore } from '@msinternal/botframework-webchat-react-hooks';
import type { createStore } from 'botframework-webchat-core';
import { createContext, useCallback, useContext } from 'react';

type WebChatReduxStore = ReturnType<typeof createStore>;

type WebChatReduxContextType = {
  readonly store: WebChatReduxStore;
  readonly subscribe: (listener: () => void) => () => void;
};

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

/**
 * Selects a value from the Redux store and re-renders when it changes, with `useSyncExternalStore()`.
 *
 * Declare `selector` outside of the component: a new function on every render makes React check the store again after every render.
 */
function useSelector<T>(selector: (state: ReturnType<WebChatReduxStore['getState']>) => T): T {
  const { store, subscribe } = useWebChatReduxContext();

  return useSyncExternalStore(
    subscribe,
    useCallback(() => selector(store.getState()), [selector, store])
  );
}

export default context;

export {
  useDispatch,
  useSelector,
  useStore,
  useWebChatReduxContext,
  type WebChatReduxContextType,
  type WebChatReduxStore
};
