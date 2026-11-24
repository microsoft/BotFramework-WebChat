import type { Dispatch, Middleware, MiddlewareAPI } from 'redux';

import type { EngineStore } from './createEngineStore';

/**
 * Applies middleware to an engine store, as `applyMiddleware()` of Redux 5.0.1: the first middleware is the outermost,
 * and `dispatch()` of the middleware API runs the whole chain, once it is built.
 */
export default function applyEngineMiddleware<TState>(
  store: EngineStore<TState>,
  middlewares: readonly Middleware[]
): EngineStore<TState> {
  let dispatch: Dispatch = () => {
    throw new Error(
      'Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.'
    );
  };

  const middlewareAPI: MiddlewareAPI = {
    dispatch: (action, ...args) => dispatch(action, ...args),
    getState: store.getState
  };

  dispatch = middlewares
    .map(middleware => middleware(middlewareAPI))
    .reduceRight<Dispatch>((next, chain) => chain(next) as Dispatch, store.dispatch);

  return Object.freeze({ ...store, dispatch });
}
