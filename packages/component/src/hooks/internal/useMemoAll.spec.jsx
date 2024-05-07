/** @jest-environment jsdom */
/* eslint-disable react/prop-types */
/* eslint-disable no-undef */
/* eslint no-magic-numbers: "off" */
import React from 'react';
import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';
import useMemoize from './useMemoAll';

const testHook = fun => {
  let state;
  const UseComponent = ({ useTest }) => {
    useTest();
    return null;
  };
  const TestComponent = () => {
    state = React.useState();
    const [useTest] = state;
    if (useTest) {
      return <UseComponent useTest={useTest} />;
    }

    return <React.Fragment />;
  };

  const root = document.createElement('div');
  render(<TestComponent />, root);

  return (...args) => {
    const [_useTest, setTest] = state;
    return new Promise(resolve => {
      act(() => {
        setTest(() => () => resolve(fun(...args)));
      });
    });
  };
};

test('useMemoize should cache result across runs', async () => {
  const expensiveSum = jest.fn((x, y) => x + y);

  const render = testHook(doMemoChecks => {
    // Start a run, all calls to sum() will be cached.
    useMemoize(expensiveSum, sum => doMemoChecks(sum), []);
  });

  await render(sum => {
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
  await render(sum => {
    expect(sum(1, 2)).toBe(3); // Cached from previous run, return 3.
    expect(sum(3, 6)).toBe(9); // Not cached, return 9.
  });

  expect(expensiveSum).toHaveBeenCalledTimes(3);
  expect(expensiveSum.mock.calls[2]).toEqual([3, 6]);

  // After the run, only 1 + 2 = 3 and 3 + 6 = 9 is cached. 2 + 4 is dropped.

  // Start another run with previous cache
  await render(sum => {
    expect(sum(2, 4)).toBe(6); // Not cached, return 6
  });

  expect(expensiveSum).toHaveBeenCalledTimes(4);
  expect(expensiveSum.mock.calls[3]).toEqual([2, 4]);
});

test('useMemoize should cache result if deps change', async () => {
  const expensiveSum = jest.fn((x, y) => x + y);

  const render = testHook(doMemoChecks => {
    // Start a run, all calls to sum() will be cached.
    useMemoize(expensiveSum, sum => doMemoChecks(sum), [{}]);
  });

  // Start a run, all calls to sum() will be cached.
  await render(sum => {
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
  await render(sum => {
    expect(sum(1, 2)).toBe(3); // Cached from previous run, return 3.
    expect(sum(3, 6)).toBe(9); // Not cached, return 9.
  });

  expect(expensiveSum).toHaveBeenCalledTimes(3);
  expect(expensiveSum.mock.calls[2]).toEqual([3, 6]);

  // After the run, only 1 + 2 = 3 and 3 + 6 = 9 is cached. 2 + 4 is dropped.

  // Start another run with previous cache
  await render(sum => {
    expect(sum(1, 2)).toBe(3); // Cached from previous run, return 3.
    expect(sum(2, 4)).toBe(6); // Not cached, return 6
  });

  expect(expensiveSum).toHaveBeenCalledTimes(4);
  expect(expensiveSum.mock.calls[3]).toEqual([2, 4]);
});

test('useMemoize should not share cache across hooks', async () => {
  const expensiveSum = jest.fn((x, y) => x + y);

  const render = testHook(doMemoChecks => {
    // Start a run, all calls to sum() will be cached.
    useMemoize(expensiveSum, sum => doMemoChecks(sum), []);
    useMemoize(expensiveSum, sum => doMemoChecks(sum), []);
  });

  // Start a run, all calls to sum() will be cached.
  await render(sum => {
    expect(sum(1, 2)).toBe(3); // Not cached, return 3.
    expect(sum(1, 2)).toBe(3); // Cached, return 3.
    expect(sum(2, 4)).toBe(6); // Not cached, return 6.
    expect(sum(1, 2)).toBe(3); // Cached, return 3. This is cached because it is inside the same run.
  });

  expect(expensiveSum).toHaveBeenCalledTimes(4);

  expect(expensiveSum.mock.calls[0]).toEqual([1, 2]);
  expect(expensiveSum.mock.calls[1]).toEqual([2, 4]);
  expect(expensiveSum.mock.calls[2]).toEqual([1, 2]);
  expect(expensiveSum.mock.calls[3]).toEqual([2, 4]);
});
