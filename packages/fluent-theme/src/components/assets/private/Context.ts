import { createContext } from 'react';

import type { AssetName } from '../AssetName';

type ContextType = Readonly<{
  urlStateMap: ReadonlyMap<AssetName, readonly [URL]>;
}>;

type ContextAsGetter<T extends Record<string, unknown>> =
  T extends Record<infer K, infer V> ? Record<K, { get(): V }> : never;

const defaultContextValue: ContextAsGetter<ContextType> = {
  urlStateMap: {
    get() {
      throw new Error('urlMap cannot be used outside of <AssetComposerContext>.');
    }
  }
};

const Context = createContext<ContextType>(Object.create({}, defaultContextValue));

Context.displayName = 'AssetComposerContext';

export default Context;
