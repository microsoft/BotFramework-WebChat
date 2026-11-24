/**
 * @jest-environment @happy-dom/jest-environment
 */
import createChannel from './createChannel';
import createScope from './createScope';

function createRoot() {
  const calls: string[] = [];
  const timers = new Map<number, () => void>();
  let nextHandle = 0;
  const ponyfill = {
    clearTimeout: (handle: number) => {
      calls.push(`clearTimeout(${handle})`);
      timers.delete(handle);
    },
    setTimeout: (fn: () => void) => {
      timers.set(++nextHandle, fn);

      return nextHandle;
    }
  } as any;
  const root = createScope(
    {
      channel: createChannel(),
      host: { dispatch: () => undefined, getState: () => ({}), onError: () => calls.push('onError'), ponyfill }
    },
    undefined
  );

  return { calls, root, timers };
}

describe('a scope', () => {
  test('clears the timer of a sleep when it stops (redux-saga leaves it running)', () => {
    const { calls, root, timers } = createRoot();

    root.start(scope => {
      scope.sleep(1000, () => calls.push('slept'));
    });
    root.stop();

    expect(calls).toEqual(['clearTimeout(1)']);
    expect(timers.size).toBe(0);
  });

  test('runs its finally callbacks last first, then stops its children in the order they were forked', () => {
    const { calls, root } = createRoot();

    root.start(scope => {
      scope.finally(cancelled => calls.push(`outer finally ${cancelled}`));
      scope.finally(cancelled => calls.push(`inner finally ${cancelled}`));
      scope.fork(child => child.finally(() => calls.push('child 1')) || child.sleep(1, () => undefined));
      scope.fork(child => child.finally(() => calls.push('child 2')) || child.sleep(1, () => undefined));
      scope.sleep(1, () => undefined);
    });
    root.stop();

    expect(calls).toEqual([
      'clearTimeout(3)',
      'inner finally true',
      'outer finally true',
      'clearTimeout(1)',
      'child 1',
      'clearTimeout(2)',
      'child 2'
    ]);
  });

  test('runs its finally callbacks with false when it waits for nothing more', async () => {
    const { calls, root } = createRoot();

    root.start(scope => {
      scope.finally(cancelled => calls.push(`finally ${cancelled}`));
      scope.wait(Promise.resolve(), () => calls.push('resolved'));
    });

    await Promise.resolve();
    await Promise.resolve();

    expect(calls).toEqual(['resolved', 'finally false']);
  });
});
