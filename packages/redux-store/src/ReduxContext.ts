import { useSyncExternalStore } from '@msinternal/botframework-webchat-react-hooks';
import { createContext, useCallback, useContext } from 'react';
import { type Store } from 'redux';

type ReduxContextType<TStore extends Store = Store> = {
  readonly store: TStore;
  readonly subscribe: (listener: () => void) => () => void;
};

const context = createContext<ReduxContextType | undefined>(undefined);

context.displayName = 'ReduxContext';

function useReduxContext<TStore extends Store = Store>(): ReduxContextType<TStore> {
  const value = useContext(context);

  if (!value) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  // The caller knows the type of the store it passed to <ReduxProvider>.
  return value as ReduxContextType<TStore>;
}

function useStore<TStore extends Store = Store>(): TStore {
  return useReduxContext<TStore>().store;
}

function useDispatch<TStore extends Store = Store>(): TStore['dispatch'] {
  return useStore<TStore>().dispatch;
}

/**
 * Selects a value from the Redux store and re-renders when it changes, with `useSyncExternalStore()`.
 *
 * Declare `selector` outside of the component: a new function on every render makes React check the store again after every render.
 */
function useSelector<TState = unknown, TSelected = unknown>(selector: (state: TState) => TSelected): TSelected {
  const { store, subscribe } = useReduxContext<Store<TState>>();

  return useSyncExternalStore(
    subscribe,
    useCallback(() => selector(store.getState()), [selector, store])
  );
}

export default context;

export { useDispatch, useReduxContext, useSelector, useStore, type ReduxContextType };
