import type { createStore } from 'botframework-webchat-core';
import { createContext, useContext, useLayoutEffect, useReducer, useRef } from 'react';

type WebChatReduxStore = ReturnType<typeof createStore>;

type WebChatReduxContextType = {
  readonly store: WebChatReduxStore;
  readonly subscribe: (listener: () => void) => () => void;
};

const context = createContext<WebChatReduxContextType | undefined>(undefined);

context.displayName = 'WebChatReduxContext';

function increment(value: number): number {
  return value + 1;
}

function refEquality<T>(x: T, y: T): boolean {
  return x === y;
}

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
 * Selects a value from the Redux store and re-renders when it changes, like `useSelector()` of `react-redux@7`.
 *
 * Re-renders are scheduled by `useReducer()`, at the same priority as `useState()` of other components that follow the store.
 * `useSyncExternalStore()` would re-render with a higher priority on React 18 and later,
 * ahead of activities that `<GraphProvider>` propagates through `useState()`.
 */
function useSelector<T>(
  selector: (state: ReturnType<WebChatReduxStore['getState']>) => T,
  equalityFn: (x: T, y: T) => boolean = refEquality
): T {
  const { store, subscribe } = useWebChatReduxContext();
  const [, forceRender] = useReducer(increment, 0);
  const latestRef = useRef<
    | {
        readonly equalityFn: (x: T, y: T) => boolean;
        readonly selector: (state: ReturnType<WebChatReduxStore['getState']>) => T;
        readonly value: T;
      }
    | undefined
  >();

  const nextValue = selector(store.getState());

  // Keeps the previous value if it is equal, so a custom `equalityFn` returns a stable reference.
  const value =
    latestRef.current && equalityFn(latestRef.current.value, nextValue) ? latestRef.current.value : nextValue;

  useLayoutEffect(() => {
    latestRef.current = Object.freeze({ equalityFn, selector, value });
  });

  useLayoutEffect(() => {
    const handleChange = () => {
      const { current } = latestRef;

      try {
        const nextValue = current.selector(store.getState());

        if (current.equalityFn(current.value, nextValue)) {
          return;
        }

        // Remembers the new value now, so a dispatch before the re-render (e.g. during render) does not re-render again.
        latestRef.current = Object.freeze({ ...current, value: nextValue });
      } catch {
        // Re-renders to throw the error from the selector.
      }

      forceRender();
    };

    // Catches changes between render and subscription.
    handleChange();

    return subscribe(handleChange);
  }, [forceRender, latestRef, store, subscribe]);

  return value;
}

export default context;

export { useDispatch, useSelector, useStore, type WebChatReduxContextType, type WebChatReduxStore };
