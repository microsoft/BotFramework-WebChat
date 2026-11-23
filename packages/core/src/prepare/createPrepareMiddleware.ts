import type { Middleware } from 'redux';
import { v4 } from 'uuid';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { RestrictedStoreDebugAPI } from '../types/StoreDebugAPI';
import prepareAction from './prepareAction';
import runEffects from './runEffects';

/**
 * The innermost middleware: prepares each action (`prepareAction()`), runs its side effects (`runEffects()`), then
 * passes it to the reducers. Every action passes here, the ones of the host and of the sagas too. The middleware
 * outside, and `dispatch()`'s return value, keep the action as it was dispatched.
 */
export default function createPrepareMiddleware({
  debugAPI,
  ponyfill
}: {
  readonly debugAPI: RestrictedStoreDebugAPI;
  readonly ponyfill: GlobalScopePonyfill;
}): Middleware {
  const deps = Object.freeze({ newId: v4, now: () => ponyfill.Date.now() });

  return ({ getState }) =>
    next =>
    (action: any) => {
      const prepared = prepareAction(action, deps);

      // Before the reducers, as when they ran inside them: before the store listeners and their nested dispatches, and
      // also when a reducer throws. `getState()` is the state the reducers get.
      runEffects(prepared, { debugAPI, previousState: getState() });

      const result = next(prepared);

      // Redux's `dispatch()` returns the action it got: return the dispatched one. Anything else (an enhancer's) passes.
      return result === prepared ? action : result;
    };
}
