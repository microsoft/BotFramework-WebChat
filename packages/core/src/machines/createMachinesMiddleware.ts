import type { Middleware } from 'redux';

import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';
import createMachines, { type Machines } from './createMachines';

/**
 * The machines in Redux mode, where the saga middleware was: the innermost middleware. Each action is reduced first,
 * then goes to the machines; what they put goes through every middleware again.
 */
export default function createMachinesMiddleware({
  onError,
  ponyfill
}: {
  readonly onError: (error: unknown) => void;
  readonly ponyfill: GlobalScopePonyfill;
}): { readonly middleware: Middleware; readonly start: () => void } {
  let machines: Machines | undefined;

  return Object.freeze({
    middleware: ({ dispatch, getState }) => {
      const instance = createMachines({ dispatch, getState, onError, ponyfill });

      machines = instance;

      return next => action => {
        const result = next(action);

        instance.afterReduce(action as any);

        return result;
      };
    },
    start: () => machines?.start()
  });
}
