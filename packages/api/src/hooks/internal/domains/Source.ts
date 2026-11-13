/**
 * A value that can be read at any time and observed for changes. Hooks read it through `useSourceValue()`.
 *
 * A source should keep its identity for as long as it reads from the same place: `useSourceValue()` reads it again when
 * the source changes, and subscribes again when its `subscribe` changes.
 */
type Source<T> = {
  readonly get: () => T;
  readonly subscribe: (listener: () => void) => () => void;
};

export { type Source };
