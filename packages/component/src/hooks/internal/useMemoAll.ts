import { useEffect, useMemo, useRef, type DependencyList } from 'react';
import { useRefFrom } from 'use-ref-from';

type Cache<TArgs, TResult> = { args: TArgs[]; result: TResult };
type Fn<TArgs, TResult> = (...args: TArgs[]) => TResult;

/**
 * `useMemoize` will memoize multiple calls to the same memoize function.
 *
 * This is similar to `useMemo`. But instead of calling it once, `useMemoize` enables multiple calls while the `callback` function is executed.
 *
 * We store cache outside of the memo, so that even in case when dependencies change we're able to use the previous cache for subsequent invocations
 *
 * @param {Fn<TArgs, TIntermediate>} fn - The function to be memoized.
 * @param {(fn: Fn<TArgs, TIntermediate>) => TFinal} callback - When called, this function should execute the memoizing function.
 * @param {DependencyList} deps - Dependencies to detect for chagnes.
 */
export default function useMemoized<TIntermediate, TFinal>(
  fn: Fn<unknown, TIntermediate>,
  callback: (fn: Fn<unknown, TIntermediate>) => TFinal,
  deps: DependencyList
): TFinal {
  if (typeof fn !== 'function') {
    throw new Error('The first argument must be a function.');
  } else if (typeof callback !== 'function') {
    throw new Error('The second argument must be a function.');
  } else if (!Array.isArray(deps)) {
    throw new Error('The third argument must be an array.');
  }

  const fnRef = useRefFrom<Fn<unknown, TIntermediate>>(fn);
  const cacheRef = useRef<Cache<unknown, TIntermediate>[]>([]);
  const nextCacheRef = useRef<Cache<unknown, TIntermediate>[]>([]);

  const memoizedFn = useMemo(
    () => (run: (fn: Fn<unknown, TIntermediate>) => TFinal) => {
      const { current: fn } = fnRef;
      const { current: cache } = cacheRef;
      const { current: nextCache } = nextCacheRef;
      const localCache: Cache<unknown, TIntermediate>[] = [];
      const result = run((...args) => {
        const { result } = [...cache, ...localCache, ...nextCache].find(
          ({ args: cachedArgs }) =>
            args.length === cachedArgs.length && args.every((arg, index) => Object.is(arg, cachedArgs[+index]))
        ) || { result: fn(...args) };

        localCache.push({ args, result });

        return result;
      });

      nextCacheRef.current = [...nextCache, ...localCache];

      return result;
    },
    // We are manually creating the deps here. The "callback" arg is also designed not to be impact deps, similar to useEffect(fn), where "fn" is not in deps.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [fnRef, cacheRef, ...deps]
  );

  useEffect(() => {
    cacheRef.current = nextCacheRef.current;
    nextCacheRef.current = [];
  });

  return memoizedFn(callback);
}
