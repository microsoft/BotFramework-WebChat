import {
  applyMiddleware,
  createStore as createReduxStore,
  type Middleware,
  type Reducer,
  type Store,
  type StoreEnhancer,
  type StoreEnhancerStoreCreator
} from 'redux';

import sagaError from './actions/sagaError';
import createEngineStore, { type EngineStore } from './engine/createEngineStore';
import createMachinesMiddleware from './machines/createMachinesMiddleware';
import createPrepareMiddleware from './prepare/createPrepareMiddleware';
import reducer from './reducer';
import { RestrictedStoreDebugAPI } from './types/StoreDebugAPI';

import type { GlobalScopePonyfill } from './types/GlobalScopePonyfill';
import StoreDebugAPIRegistry from './internal/StoreDebugAPIRegistry';

// The Redux DevTools browser extension sets this global, Redux Toolkit reads it the same way.
// Typed here instead of globally, so it is not part of the published typings.
type WindowWithReduxDevTools = Window & {
  readonly __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: ((enhancer: StoreEnhancer) => StoreEnhancer) | undefined;
};

type CreateStoreOptions = {
  /**
   * True, to enable Redux development tools, otherwise, false.
   *
   * Because Web Chat keeps some of its business logic state outside of the store (in its machines), time-travelling
   * and saving/restoring store state are not supported.
   */
  devTools?: boolean;

  /**
   * Ponyfill to overrides specific global scope members.
   *
   * This option is for development use only. Not all features in Web Chat are ponyfilled.
   *
   * To fake timers, `setTimeout` and related functions can be passed to overrides the original global scope members.
   *
   * Please see [#4662](https://github.com/microsoft/BotFramework-WebChat/pull/4662) for details.
   */
  ponyfill?: Partial<GlobalScopePonyfill>;
};

// The complexity is introduced by the check of ponyfill.
// eslint-disable-next-line complexity
function resolvePonyfill(ponyfillFromOptions: Partial<GlobalScopePonyfill>): GlobalScopePonyfill {
  // IE Mode does not have `globalThis`.
  const globalThisOrWindow = typeof globalThis === 'undefined' ? window : globalThis;

  // TODO: [P2] Dedupe: when we have an utility package, move this code there and mark it as internal use.
  return {
    cancelAnimationFrame:
      ponyfillFromOptions.cancelAnimationFrame ||
      // Using clock functions from global if not provided.
      // eslint-disable-next-line no-restricted-globals
      (typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame.bind(globalThisOrWindow) : undefined),
    cancelIdleCallback:
      ponyfillFromOptions.cancelIdleCallback ||
      // eslint-disable-next-line no-restricted-globals
      (typeof cancelIdleCallback === 'function' ? cancelIdleCallback.bind(globalThisOrWindow) : undefined),
    clearImmediate:
      ponyfillFromOptions.clearImmediate ||
      // eslint-disable-next-line no-restricted-globals
      (typeof clearImmediate === 'function' ? clearImmediate.bind(globalThisOrWindow) : undefined),
    clearInterval:
      ponyfillFromOptions.clearInterval ||
      // eslint-disable-next-line no-restricted-globals
      (typeof clearInterval === 'function' ? clearInterval.bind(globalThisOrWindow) : undefined),
    clearTimeout:
      ponyfillFromOptions.clearTimeout ||
      // eslint-disable-next-line no-restricted-globals
      (typeof clearTimeout === 'function' ? clearTimeout.bind(globalThisOrWindow) : undefined),
    // eslint-disable-next-line no-restricted-globals
    Date: ponyfillFromOptions.Date || Date,
    requestAnimationFrame:
      ponyfillFromOptions.requestAnimationFrame ||
      // eslint-disable-next-line no-restricted-globals
      (typeof requestAnimationFrame === 'function' ? requestAnimationFrame.bind(globalThisOrWindow) : undefined),
    requestIdleCallback:
      ponyfillFromOptions.requestIdleCallback ||
      // eslint-disable-next-line no-restricted-globals
      (typeof requestIdleCallback === 'function' ? requestIdleCallback.bind(globalThisOrWindow) : undefined),
    setImmediate:
      ponyfillFromOptions.setImmediate ||
      // eslint-disable-next-line no-restricted-globals
      (typeof setImmediate === 'function' ? setImmediate.bind(globalThisOrWindow) : undefined),
    setInterval:
      ponyfillFromOptions.setInterval ||
      // eslint-disable-next-line no-restricted-globals
      (typeof setInterval === 'function' ? setInterval.bind(globalThisOrWindow) : undefined),
    setTimeout:
      ponyfillFromOptions.setTimeout ||
      // eslint-disable-next-line no-restricted-globals
      (typeof setTimeout === 'function' ? setTimeout.bind(globalThisOrWindow) : undefined)
  };
}

/**
 * Builds the store of Web Chat on a base store: the reducer, the machines after every middleware of the host, and the
 * debug API.
 */
function assemble<TStore extends EngineStore>(
  ponyfillFromOptions: Partial<GlobalScopePonyfill> | undefined,
  initialState: any,
  middlewares: readonly Middleware[],
  createBaseStore: (reducer: Reducer, preloadedState: any, chain: readonly Middleware[]) => TStore
): TStore {
  const ponyfill = resolvePonyfill(ponyfillFromOptions || {});

  // We are doing lazy init and cyclic dependencies.
  // eslint-disable-next-line prefer-const
  let store: TStore | undefined;

  const restrictedStoreDebugAPI = new RestrictedStoreDebugAPI(() => store?.getState().activities);

  // The machines run after every middleware of the host, and start once the store exists.
  const machines = createMachinesMiddleware({
    // An error that no machine catches stops every machine.
    onError: error => {
      console.error(error);
      store && store.dispatch(sagaError());
    },
    ponyfill
  });

  // Innermost: the reducers get every action prepared, the host middleware and the machines see it as dispatched.
  // `internal.ponyfill` is for `<Composer>`, to check that it matches its own; the reducer keeps it as it is.
  store = createBaseStore(reducer, { ...initialState, internal: { ponyfill } }, [
    ...middlewares,
    machines.middleware,
    createPrepareMiddleware({ debugAPI: restrictedStoreDebugAPI, ponyfill })
  ]);

  // TODO: [P1] When we redesign the store and chat adapter, we should have the Debug API stored somewhere else.
  StoreDebugAPIRegistry.set(store, restrictedStoreDebugAPI.toPublic());

  // TODO: [P1] When we redesign the store and chat adapter, we shoulstore.getState().activities
  machines.start();

  return store;
}

/**
 * Creates a Redux store internally used by Web Chat.
 *
 * This store is critical for Web Chat business logics to operate, please use with cautions.
 */
export function withOptions(
  options: CreateStoreOptions,
  initialState?: any | undefined,
  ...middlewares: readonly Middleware[]
): Store {
  return assemble(options.ponyfill, initialState, middlewares, (reducer, preloadedState, chain) => {
    const enhancer = applyMiddleware(...chain);

    const devToolsWindow: WindowWithReduxDevTools | undefined =
      options.devTools && typeof window !== 'undefined' ? window : undefined;
    const composeWithDevTools = devToolsWindow?.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    return createReduxStore(reducer, preloadedState, composeWithDevTools ? composeWithDevTools(enhancer) : enhancer);
  });
}

/**
 * Creates the store of Web Chat on the engine instead of Redux: the same reducer, machines and middleware, without
 * enhancers (`devTools` is ignored).
 *
 * Internal, for tests until it replaces the Redux store.
 */
export function createWebChatEngine(
  options: Readonly<Pick<CreateStoreOptions, 'ponyfill'>>,
  initialState?: any | undefined,
  ...middlewares: readonly Middleware[]
): EngineStore {
  return assemble(options.ponyfill, initialState, middlewares, (reducer, preloadedState, chain) =>
    // Redux's own `applyMiddleware()`, until the engine replaces the Redux store and `redux` goes.
    Object.freeze(
      applyMiddleware(...chain)(createEngineStore as StoreEnhancerStoreCreator)(reducer, preloadedState) as EngineStore
    )
  );
}

/**
 * Creates a Redux store internally used by Web Chat.
 *
 * This store is critical for Web Chat business logics to operate, please use with cautions.
 */
export default function createStore(initialState?: any, ...middlewares: readonly Middleware[]): Store {
  return withOptions({}, initialState, ...middlewares);
}

/**
 * Creates a Redux store internally used by Web Chat, with Redux development tools.
 *
 * This store is critical for Web Chat business logics to operate, please use with cautions.
 *
 * @deprecated Use `withOptions` instead and pass `{ devTools: true }`
 */
export function withDevTools(initialState?: any, ...middlewares: readonly Middleware[]): Store {
  return withOptions({ devTools: true }, initialState, ...middlewares);
}
