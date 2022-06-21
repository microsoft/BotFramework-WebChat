import { DependencyList, useMemo } from 'react';

type Cache<TArgs, TResult> = { args: TArgs[]; result: TResult };
type Fn<TArgs, TResult> = (...args: TArgs[]) => TResult;

/**
 * `useMemoize` will memoize multiple calls to the same memoize function.
 *
 * This is similar to `useMemo`. But instead of calling it once, `useMemoize` enables multiple calls while the `callback` function is executed.
 *
 * @param {Fn<TArgs, TIntermediate>} fn - The function to be memoized.
 * @param {(fn: Fn<TArgs, TIntermediate>) => TFinal} callback - When called, this function should execute the memoizing function.
 * @param {DependencyList[]} deps - Dependencies to detect for chagnes.
 */
export default function useMemoize<TIntermediate, TFinal>(
  fn: Fn<unknown, TIntermediate>,
  callback: (fn: Fn<unknown, TIntermediate>) => TFinal,
  deps: DependencyList[]
): TFinal {
  if (typeof fn !== 'function') {
    throw new Error('The first argument must be a function.');
  } else if (typeof callback !== 'function') {
    throw new Error('The second argument must be a function.');
  } else if (!Array.isArray(deps)) {
    throw new Error('The third argument must be an array.');
  }

  const memoizedFn = useMemo(() => {
    let cache: Cache<unknown, TIntermediate>[] = [];

    return (run: (fn: Fn<unknown, TIntermediate>) => TFinal) => {
      const nextCache: Cache<unknown, TIntermediate>[] = [];
      const result = run((...args) => {
        const { result } = [...cache, ...nextCache].find(
          ({ args: cachedArgs }) =>
            args.length === cachedArgs.length && args.every((arg, index) => Object.is(arg, cachedArgs[+index]))
        ) || { result: fn(...args) };

        nextCache.push({ args, result });

        return result;
      });

      cache = nextCache;

      return result;
    };
    // We are manually creating the deps here. The "callback" arg is also designed not to be impact deps, similar to useEffect(fn), where "fn" is not in deps.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [fn, ...deps]);

  return memoizedFn(callback);
}
