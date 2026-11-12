import { createContext, useContext, type Context } from 'react';

/**
 * Creates the context of a domain and a hook to read it.
 *
 * Like `useReduxContext()`, reading it outside of `<Composer>` throws.
 */
export default function createDomainContext<T>(displayName: string): readonly [Context<T | undefined>, () => T] {
  const context = createContext<T | undefined>(undefined);

  context.displayName = displayName;

  return Object.freeze([
    context,
    function useDomainContext(): T {
      const value = useContext(context);

      if (!value) {
        throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
      }

      return value;
    }
  ] as const);
}
