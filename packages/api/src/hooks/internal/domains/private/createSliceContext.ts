import { createContext, useContext, type Context } from 'react';

const NO_PROVIDER = Symbol('no provider');

/**
 * Creates the context of one slice of the state (a value, not a source) and a hook to read it: a hook re-renders when
 * its slice changes, as with `useSelector()` of the slice.
 *
 * Like the domain contexts, reading it outside of `<Composer>` throws.
 */
export default function createSliceContext<T>(
  displayName: string
): readonly [Context<T | typeof NO_PROVIDER>, () => T] {
  const context = createContext<T | typeof NO_PROVIDER>(NO_PROVIDER);

  context.displayName = displayName;

  return Object.freeze([
    context,
    function useSlice(): T {
      const value = useContext(context);

      if (value === NO_PROVIDER) {
        throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
      }

      return value;
    }
  ] as const);
}
