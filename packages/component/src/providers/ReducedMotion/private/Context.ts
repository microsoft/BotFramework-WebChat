import { createContext } from 'react';

type ContextType = Readonly<{
  shouldReduceMotionState: readonly [boolean];
}>;

type ContextAsGetter<T extends Record<string, unknown>> =
  T extends Record<infer K, infer V> ? Record<K, { get(): V }> : never;

const defaultContextValue: ContextAsGetter<ContextType> = {
  shouldReduceMotionState: {
    get() {
      throw new Error('shouldReduceMotionState cannot be used outside of <ReducedMotionComposer>.');
    }
  }
};

const Context = createContext<ContextType>(Object.create({}, defaultContextValue));

Context.displayName = 'ReducedMotionComposer';

export default Context;
