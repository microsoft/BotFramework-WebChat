import { useEffect, useMemo, useRef, type DependencyList } from 'react';
import { useRefFrom } from 'use-ref-from';

type Cache<TArgs, TResult> = { args: TArgs[]; result: TResult };
type Fn<TArgs, TResult> = (...args: TArgs[]) => TResult;

/**
 * `useMemoized` will memoize multiple calls to the same memoize function.
 *
 * @param {Fn<TArgs, TResult>} fn - The function to be memoized.
 * @param {DependencyList} deps - Dependencies to detect for chagnes.
 */
export default function useMemoized<TFinal, TArgs>(fn: Fn<TArgs, TFinal>, deps: DependencyList): Fn<TArgs, TFinal> {
  if (typeof fn !== 'function') {
    throw new Error('The first argument must be a function.');
  } else if (!Array.isArray(deps)) {
    throw new Error('The second argument must be an array.');
  }

  // Hook-style inline fn: changing it won't trigger updates unless deps change
  const fnRef = useRefFrom<Fn<TArgs, TFinal>>(fn);
  // Use both caches to read cached values, but store only
  // to the next cache, so we could distingish between values
  // added during render discarding value cached previously
  const cacheRef = useRef<Cache<TArgs, TFinal>[]>();
  const nextCacheRef = useRef<Cache<TArgs, TFinal>[]>();

  const memoizedFn = useMemo(
    () => {
      // Empty both caches on fresh run to avoid leakage of
      // previously cached values into new memoizedFn calls
      cacheRef.current = [];
      nextCacheRef.current = [];

      const memoizedFn = (...args) => {
        const { current: fn } = fnRef;
        const { current: cache } = cacheRef;
        const { current: nextCache } = nextCacheRef;
        const { result } = [...cache, ...nextCache].find(
          ({ args: cachedArgs }) =>
            args.length === cachedArgs.length && args.every((arg, index) => Object.is(arg, cachedArgs[+index]))
        ) || { result: fn(...args) };

        nextCache.push({ args, result });

        return result;
      };

      return memoizedFn;
    },
    // Concat our deps with passed deps, so the memo callback runs when anything changes
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [fnRef, cacheRef, nextCacheRef, ...deps]
  );

  useEffect(() => {
    // At the end of each render turn around caches so that
    // we keep only used in this render call cached values
    cacheRef.current = nextCacheRef.current;
    nextCacheRef.current = [];
  });

  return memoizedFn;
}
