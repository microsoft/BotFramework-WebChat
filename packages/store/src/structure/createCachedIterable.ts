/**
 * Creates an iterable which lazily iterates the source iterable once and caches the result. Subsequent iterations
 * reuse the cached result, then continue the source iteration where the last iteration left off.
 *
 * Assumes the source iterable returns the same result on every iteration. The source iterable is iterated at most once
 * and lazily, i.e. if every iteration stops early, the rest of the source iterable is never iterated.
 *
 * If the source iteration throws, the error is cached and thrown again on subsequent iterations at the same position.
 *
 * Note: as the source iteration could be continued, it is not closed (i.e. `return()` is not called) when an iteration
 * stops early.
 */
export default function createCachedIterable<T>(iterable: Iterable<T>): Iterable<T> {
  const cache: T[] = [];
  let done = false;
  let error: { readonly reason: unknown } | undefined;
  let iterator: Iterator<T> | undefined;

  const next = (index: number): IteratorResult<T, undefined> => {
    if (index < cache.length) {
      return { done: false, value: cache[+index] as T };
    } else if (error) {
      throw error.reason;
    } else if (done) {
      return { done: true, value: undefined };
    }

    let result: IteratorResult<T>;

    try {
      iterator ??= iterable[Symbol.iterator]();
      result = iterator.next();
    } catch (reason) {
      error = Object.freeze({ reason });

      throw reason;
    }

    if (result.done) {
      done = true;

      return { done: true, value: undefined };
    }

    cache.push(result.value);

    return { done: false, value: result.value };
  };

  return Object.freeze({
    [Symbol.iterator](): Iterator<T, undefined> {
      let index = 0;

      return {
        next: () => next(index++)
      };
    }
  });
}
