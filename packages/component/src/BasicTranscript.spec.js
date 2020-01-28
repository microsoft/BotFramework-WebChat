import { useMemoize } from './BasicTranscript';

jest.mock('react', () => {
  let lastDeps = [];
  let lastResult;

  return {
    ...jest.requireActual('react'),
    useMemo: (fn, deps) => {
      if (!(deps.length === lastDeps.length && deps.every((dep, index) => Object.is(dep, lastDeps[index])))) {
        lastResult = fn();
      }

      return lastResult;
    }
  };
});

test('useMemoize should cache result across runs', () => {
  const expensiveSum = jest.fn((x, y) => x + y);

  const memoizedSum = useMemoize(expensiveSum);

  // Start a run, all calls to sum() will be cached.
  memoizedSum(sum => {
    expect(sum(1, 2)).toBe(3); // Not cached, return 3.
    expect(sum(1, 2)).toBe(3); // Cached, return 3.
    expect(sum(2, 4)).toBe(6); // Not cached, return 6.
    expect(sum(1, 2)).toBe(3); // Cached, return 3. This is cached because it is inside the same run.
  });

  expect(expensiveSum).toHaveBeenCalledTimes(2);

  expect(expensiveSum.mock.calls[0]).toEqual([1, 2]);
  expect(expensiveSum.mock.calls[1]).toEqual([2, 4]);

  // After the run, 1 + 2 = 3, and 2 + 4 = 6 is cached.

  // Start another run with previous cache
  memoizedSum(sum => {
    expect(sum(1, 2)).toBe(3); // Cached from previous run, return 3.
    expect(sum(3, 6)).toBe(9); // Not cached, return 9.
  });

  expect(expensiveSum).toHaveBeenCalledTimes(3);
  expect(expensiveSum.mock.calls[2]).toEqual([3, 6]);

  // After the run, only 1 + 2 = 3 and 3 + 6 = 9 is cached. 2 + 4 is dropped.

  // Start another run with previous cache
  memoizedSum(sum => {
    expect(sum(2, 4)).toBe(6); // Not cached, return 6
  });

  expect(expensiveSum).toHaveBeenCalledTimes(4);
  expect(expensiveSum.mock.calls[3]).toEqual([2, 4]);
});
