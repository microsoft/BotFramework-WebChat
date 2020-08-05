import { useMemo } from 'react';

export default function useMemoize(fn, callback, deps) {
  if (typeof fn !== 'function') {
    throw new Error('The first argument must be a function.');
  } else if (typeof callback !== 'function') {
    throw new Error('The second argument must be a function.');
  } else if (!Array.isArray(deps)) {
    throw new Error('The third argument must be an array.');
  }

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
    // We are manually creating the deps here. The "callback" arg is also designed not to be impact deps, similar to useEffect(fn), where "fn" is not in deps.
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [fn, ...deps]);

  return memoizedFn(callback);
}
