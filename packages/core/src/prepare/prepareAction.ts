import { is, number, object, parse, string, type GenericSchema } from 'valibot';

import { INCOMING_ACTIVITY } from '../actions/incomingActivity';
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING } from '../actions/postActivity';
import { SET_NOTIFICATION } from '../actions/setNotification';
import { LocalIdSchema } from '../reducers/activities/sort/property/LocalId';
import type { PrepareDeps } from './types';

type Action = { readonly meta?: object | undefined; readonly type: string };

/** How to make a value of `meta` and the schema `assertPrepared()` checks it with. */
type Preparer = readonly [make: (deps: PrepareDeps) => unknown, schema: GenericSchema];

const fallbackId: Preparer = [({ newId }) => newId(), string()];
// TODO: [P1] We can use a UUID v6 (reorder). Then, we can drop `receivedAt`.
const localId: Preparer = [({ newId }) => parse(LocalIdSchema, `_:${newId()}`), LocalIdSchema];
const now: Preparer = [({ now }) => now(), number()];

// For each action type, every value from the clock or a random ID that its reducers may need, needed or not: the
// reducers then read them from `meta` and stay pure.
const PREPARERS: ReadonlyMap<string, Readonly<Record<string, Preparer>>> = new Map([
  [INCOMING_ACTIVITY, { fallbackId, localId, now }],
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

  const values = Object.fromEntries(Object.entries(preparers).map(([key, [make]]) => [key, make(deps)]));

  return Object.freeze({ ...action, meta: Object.freeze({ ...action.meta, ...values }) });
}

// For each action type in `PREPARERS`, the schema of the `meta` that `prepareAction()` makes (other keys allowed).
const META_SCHEMAS: ReadonlyMap<string, GenericSchema> = new Map(
  Array.from(PREPARERS, ([type, preparers]) => [
    type,
    object(Object.fromEntries(Object.entries(preparers).map(([key, [, schema]]) => [key, schema])))
  ])
);

/**
 * Returns the action if `prepareAction()` prepared it or it needs nothing. Throws if a value its reducers need is missing
 * from its `meta` or invalid.
 */
export function assertPrepared<T extends Action>(action: T): T {
  const metaSchema = META_SCHEMAS.get(action?.type);

  if (metaSchema && !is(metaSchema, action.meta)) {
    throw new Error(
      `botframework-webchat: action "${action.type}" reached the reducer without being prepared; dispatch it through the store`
    );
  }

  return action;
}
