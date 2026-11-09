/**
 * As `combineReducers()` of Redux in development: a value set to `undefined` throws to the caller, and nothing changes.
 * Redux mode throws the same error when a reducer of a slice returns `undefined` (e.g. `setDictateInterims()` without
 * interims).
 */
export default function throwIfUndefined(value: unknown, actionType: string, key: string): void {
  if (typeof value === 'undefined') {
    throw new Error(
      `When called with an action of type "${actionType}", the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`
    );
  }
}
