import { __DO_NOT_USE__ActionTypes, type Action, type Reducer, type Store } from 'redux';

import validateAction, { kindOf } from './validateAction';

/** The part of a Redux store that Web Chat and hosts use: no enhancers, `replaceReducer()` or observable. */
type EngineStore<TState = any> = Readonly<Pick<Store<TState>, 'dispatch' | 'getState' | 'subscribe'>>;

/**
 * Creates a store with the `createStore()` contract of Redux 5.0.1, without enhancers, `replaceReducer()` and the
 * observable: the same checks and messages, one reduce of the INIT action at creation, and listeners notified from a
 * snapshot taken after the reduce, so a listener added or removed while notifying counts from the next dispatch.
 */
export default function createEngineStore<TState>(
  reducer: Reducer<TState, any, any>,
  preloadedState: unknown
): EngineStore<TState> {
  let currentListeners = new Map<number, () => void>();
  let isReducing = false;
  let nextListenerId = 0;
  let nextListeners = currentListeners;
  let state = preloadedState as TState;

  // Copy on write: a dispatch notifies the map it took after the reduce.
  const ensureCanMutateNextListeners = () => {
    nextListeners === currentListeners && (nextListeners = new Map(currentListeners));
  };

  const getState = (): TState => {
    if (isReducing) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.'
      );
    }

    return state;
  };

  const subscribe = (listener: () => void): (() => void) => {
    if (typeof listener !== 'function') {
      throw new Error(`Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
    }

    if (isReducing) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.'
      );
    }

    const listenerId = nextListenerId++;
    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.set(listenerId, listener);

    return () => {
      if (!isSubscribed) {
        return;
      }

      if (isReducing) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.'
        );
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      nextListeners.delete(listenerId);
    };
  };

  const dispatch = <TAction extends Action>(action: TAction): TAction => {
    validateAction(action);

    if (isReducing) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isReducing = true;
      state = reducer(state, action);
    } finally {
      isReducing = false;
    }

    (currentListeners = nextListeners).forEach(listener => listener());

    return action;
  };

  // Redux's own INIT type while the root reducer uses its `combineReducers()`, which words its warning about unexpected
  // keys of the preloaded state after it.
  dispatch({ type: __DO_NOT_USE__ActionTypes.INIT });

  return Object.freeze({ dispatch, getState, subscribe });
}

export { type EngineStore };
