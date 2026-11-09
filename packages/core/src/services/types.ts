/**
 * A value that can be read at any time and observed for changes. Same shape as the sources of the api's domain contexts.
 */
type Source<T> = {
  readonly get: () => T;
  readonly subscribe: (listener: () => void) => () => void;
};

/**
 * Calls the listeners of a change. The api passes `unstable_batchedUpdates()`, so the hooks reading the sources of one
 * change re-render together, as with the Redux store. Defaults to calling them directly.
 */
type Notify = (callListeners: () => void) => void;

export type { Notify, Source };
