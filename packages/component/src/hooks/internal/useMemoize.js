import { useMemo } from 'react';

export default function useMemoize(fn, callback, deps) {
  const memoizedFn = useMemo(() => {
    let cache = [];

    return run => {
      const nextCache = [];
      const result = run((...args) => {
        const { result } = [...cache, ...nextCache].find(
          ({ args: cachedArgs }) =>
            args.length === cachedArgs.length && args.every((arg, index) => Object.is(arg, cachedArgs[index]))
        ) || { result: fn(...args) };

        nextCache.push({ args, result });

        return result;
      });

      cache = nextCache;

      return result;
    };
  }, [fn]);

  return useMemo(() => memoizedFn(callback), [memoizedFn, ...deps]);
}
