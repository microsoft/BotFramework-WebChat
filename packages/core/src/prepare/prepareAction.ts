import { parse } from 'valibot';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { SET_NOTIFICATION } from '../actions/setNotification';
import { LocalIdSchema } from '../reducers/activities/sort/property/LocalId';
import type { PrepareDeps } from './types';

type Action = { readonly meta?: object | undefined; readonly type: string };

// TODO: [P1] We can use a UUID v6 (reorder). Then, we can drop `receivedAt`.
const newLocalId = ({ newId }: PrepareDeps) => parse(LocalIdSchema, `_:${newId()}`);

// For each action type, every value from the clock or a random ID that its reducers may need, needed or not: the
// reducers then read them from `meta` and stay pure.
const PREPARERS: ReadonlyMap<string, (deps: PrepareDeps) => object> = new Map<string, (deps: PrepareDeps) => object>([
  [INCOMING_ACTIVITY, deps => ({ fallbackId: deps.newId(), localId: newLocalId(deps), now: deps.now() })],
  [POST_ACTIVITY_FULFILLED, deps => ({ now: deps.now() })],
  [POST_ACTIVITY_PENDING, deps => ({ localId: newLocalId(deps), now: deps.now() })],
  [SET_NOTIFICATION, deps => ({ now: deps.now() })]
]);

/**
 * Returns the action with the values its reducers need from the clock or a random ID added to its `meta`, or the same
 * action if they need none. Call it once per dispatch, before the reducers: calling the reducers again with the returned
 * action (e.g. React's Strict Mode, time travel) gives the same state.
 */
export default function prepareAction<T extends Action>(action: T, deps: PrepareDeps): T {
  const prepare = PREPARERS.get(action.type);

  return prepare ? { ...action, meta: { ...action.meta, ...prepare(deps) } } : action;
}
