import type { MachineAction, Scope } from '../types';

/** Matches the actions of these types, as the pattern of a saga `take()`. */
export function is(...types: readonly string[]): (action: MachineAction) => boolean {
  return ({ type }) => types.includes(type);
}

/** Puts the actions one after the other, then calls `then`, as consecutive `yield put()`. */
export function putEach(scope: Scope, actions: readonly MachineAction[], then?: (() => void) | undefined): void {
  const [first, ...rest] = actions;

  first ? scope.put(first, () => putEach(scope, rest, then)) : then?.();
}

/** `forkPut()` of the sagas: puts the actions one after the other, in a forked scope, without waiting for them. */
export function forkPut(scope: Scope, ...actions: readonly MachineAction[]): void {
  scope.fork(child => putEach(child, actions));
}
