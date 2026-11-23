import type { Middleware } from 'redux';
import { v4 } from 'uuid';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import type { RestrictedStoreDebugAPI } from '../types/StoreDebugAPI';
import afterDispatch from './afterDispatch';
import prepareAction from './prepareAction';

/**
 * The innermost middleware: prepares each action just before the reducers (`prepareAction()`), then runs its side
 * effects (`afterDispatch()`). Every action passes here, the ones of the host and of the sagas too. The middleware
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
      const previousState = getState();
      const result = next(prepared);

      afterDispatch(prepared, { debugAPI, previousState });

      return result === prepared ? action : result;
    };
}
