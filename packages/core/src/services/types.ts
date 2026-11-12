/**
 * A value that can be read at any time and observed for changes. Same shape as the sources of the api's domain contexts.
 */
type Source<T> = {
  readonly get: () => T;
  readonly subscribe: (listener: () => void) => () => void;
};

export type { Source };
