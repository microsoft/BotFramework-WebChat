import { parse } from 'valibot';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { SET_NOTIFICATION } from '../actions/setNotification';
import { LocalIdSchema } from '../reducers/activities/sort/property/LocalId';
import type { PrepareDeps } from './types';

type Action = { readonly meta?: object | undefined; readonly type: string };

// TODO: [P1] We can use a UUID v6 (reorder). Then, we can drop `receivedAt`.
const localId = ({ newId }: PrepareDeps) => parse(LocalIdSchema, `_:${newId()}`);
const newId = ({ newId }: PrepareDeps) => newId();
const now = ({ now }: PrepareDeps) => now();

// For each action type, every value from the clock or a random ID that its reducers may need, needed or not: the
// reducers then read them from `meta` and stay pure.
const PREPARERS: ReadonlyMap<string, Readonly<Record<string, (deps: PrepareDeps) => unknown>>> = new Map([
  [INCOMING_ACTIVITY, { fallbackId: newId, localId, now }],
  [POST_ACTIVITY_FULFILLED, { now }],
  [POST_ACTIVITY_PENDING, { localId, now }],
  [SET_NOTIFICATION, { now }]
]);

/**
 * Returns the action with the values its reducers need from the clock or a random ID added to its `meta`, or the same
 * action if they need none. Call it once per dispatch, before the reducers: calling the reducers again with the returned
 * action (e.g. React's Strict Mode, time travel) gives the same state.
 */
export default function prepareAction<T extends Action>(action: T, deps: PrepareDeps): T {
  const preparers = PREPARERS.get(action?.type);

  if (!preparers) {
    return action;
  }

  const values = Object.fromEntries(Object.entries(preparers).map(([key, make]) => [key, make(deps)]));

  return Object.freeze({ ...action, meta: Object.freeze({ ...action.meta, ...values }) });
}

/** Returns the action if `prepareAction()` prepared it or it needs nothing, throws otherwise. */
export function assertPrepared<T extends Action>(action: T): T {
  const preparers = PREPARERS.get(action?.type);

  if (preparers && !Object.keys(preparers).every(key => action.meta && key in action.meta)) {
    throw new Error(
      `botframework-webchat: action "${action.type}" reached the reducer without being prepared; dispatch it through the store`
    );
  }

  return action;
}
