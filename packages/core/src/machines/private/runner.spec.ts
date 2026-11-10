/**
 * @jest-environment @happy-dom/jest-environment
 */
// The runner of the machines, pinned: each case runs a few machines on a Redux store and checks what an outermost
// middleware sees (with the depth of each dispatch), the errors and what the machines logged themselves. The expected
// lines are what redux-saga did with sagas written as the twins of these machines, before the machines replaced it.
import { applyMiddleware, createStore, type Middleware } from 'redux';

import createMachines from '../createMachines';
import type { Machine, MachineAction } from '../types';

type Case = {
  /** What redux-saga did. */
  readonly expected: readonly string[];
  readonly host?: Middleware | undefined;
  readonly machines: (log: (line: string) => void) => readonly Machine[];
  readonly script: (dispatch: (action: MachineAction) => unknown) => Promise<void> | void;
};

const is =
  (...types: string[]) =>
  ({ type }: MachineAction) =>
    types.includes(type);

// eslint-disable-next-line no-restricted-globals
const ponyfill = { clearTimeout, setTimeout } as any;

async function run({ host, machines, script }: Case): Promise<string[]> {
  const lines: string[] = [];
  const log = (line: string) => lines.push(line);
  let depth = 0;
  // eslint-disable-next-line prefer-const
  let store: ReturnType<typeof createStore>;
  let instance: ReturnType<typeof createMachines>;

  const recorder: Middleware = () => next => (action: any) => {
    log(`${'>'.repeat(++depth)} ${action.type}`);

    try {
      return next(action);
    } catch (error) {
      log(`threw ${(error as Error).message}`);

      throw error;
    } finally {
      depth--;
    }
  };

  const onError = (error: unknown) => {
    log(`onError ${(error as Error).message}`);
    store.dispatch({ type: 'SAGA_ERROR' });
  };

  const reducer = (state = 0, { type }: MachineAction) => {
    if (type === 'REDUCER_THROWS') {
      throw new Error('reducer');
    }

    return state + 1;
  };

  const machinesMiddleware: Middleware = ({ dispatch, getState }) => {
    instance = createMachines({ dispatch, getState, onError, ponyfill }, machines(log));

    return next => action => {
      const result = next(action);

      instance.afterReduce(action as any);

      return result;
    };
  };

  store = createStore(reducer, applyMiddleware(recorder, ...(host ? [host] : []), machinesMiddleware));
  instance.start();

  try {
    await script(action => store.dispatch(action as any));
  } catch (error) {
    log(`script threw ${(error as Error).message}`);
  }

  // Let promises settle.
  for (let index = 0; index < 10; index++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }

  return lines;
}

const CASES: Readonly<Record<string, Case>> = {
  'a race: the taker that lost is not called back': {
    expected: ['> X', 'first', '> Y', 'second', '> X', 'first'],
    machines: log => [
      scope => {
        const loop = () => {
          // eslint-disable-next-line prefer-const
          let stopSecond: () => void;
          const stopFirst = scope.take(is('X'), () => {
            stopSecond();
            log('first');
            loop();
          });

          stopSecond = scope.take(is('X', 'Y'), () => {
            stopFirst();
            log('second');
            loop();
          });
        };

        loop();
      }
    ],
    script: dispatch => {
      dispatch({ type: 'X' });
      dispatch({ type: 'Y' });
      dispatch({ type: 'X' });
    }
  },
  'a put runs after the current action, and the worker goes on after its own put': {
    expected: ['> A', '>> B', '>> D', '>> C', '> A', '>> B', '>> D', '>> C'],
    machines: () => [
      scope => scope.on(is('A'), (_, worker) => worker.put({ type: 'B' }, () => worker.put({ type: 'C' }))),
      scope => scope.on(is('B'), (_, worker) => worker.put({ type: 'D' }))
    ],
    script: dispatch => {
      dispatch({ type: 'A' });
      dispatch({ type: 'A' });
    }
  },
  'a taker that took an action waits again at the end': {
    expected: [
      '> Y',
      '>> first took Y',
      '>> second took Y',
      '> X',
      '>> first took X',
      '> Y',
      '>> second took Y',
      '>> first took Y'
    ],
    machines: () => [
      scope => scope.on(is('X', 'Y'), ({ type }, worker) => worker.put({ type: `first took ${type}` })),
      scope => scope.on(is('Y'), ({ type }, worker) => worker.put({ type: `second took ${type}` }))
    ],
    script: dispatch => {
      dispatch({ type: 'Y' });
      dispatch({ type: 'X' });
      dispatch({ type: 'Y' });
    }
  },
  'a put cloned by a host middleware is taken after the current task': {
    expected: ['> A', '>> B', '>> C', '>> D'],
    host: () => next => (action: any) => next(action.type === 'B' ? { ...action } : action),
    machines: () => [
      scope => scope.on(is('A'), (_, worker) => worker.put({ type: 'B' }, () => worker.put({ type: 'C' }))),
      scope => scope.on(is('B'), (_, worker) => worker.put({ type: 'D' }))
    ],
    script: dispatch => {
      dispatch({ type: 'A' });
    }
  },
  'a host middleware that dispatches inside a put, before passing it on': {
    expected: ['> A', '>> B', '>>> FROM_HOST', '>> took B', '>> C', '>> took FROM_HOST'],
    host:
      ({ dispatch }) =>
      next =>
      (action: any) => {
        action.type === 'B' && dispatch({ type: 'FROM_HOST' });

        return next(action);
      },
    machines: () => [
      scope => scope.on(is('A'), (_, worker) => worker.put({ type: 'B' }, () => worker.put({ type: 'C' }))),
      scope => scope.on(is('B', 'FROM_HOST'), ({ type }, worker) => worker.put({ type: `took ${type}` }))
    ],
    script: dispatch => {
      dispatch({ type: 'A' });
    }
  },
  'a worker that waits for any action does so before its taker waits again': {
    expected: ['> REG', 'start 1', '> REG', 'worker 1 took REG', 'start 2', '> OTHER', 'worker 2 took OTHER'],
    machines: log => [
      scope =>
        scope.on(is('REG'), ({ n }, worker) => {
          log(`start ${n}`);
          worker.take(
            () => true,
            ({ type }) => log(`worker ${n} took ${type}`)
          );
        })
    ],
    script: dispatch => {
      dispatch({ n: 1, type: 'REG' });
      dispatch({ n: 2, type: 'REG' });
      dispatch({ type: 'OTHER' });
    }
  },
  'the latest stops the one before, which puts in its finally': {
    expected: ['> L', '> L', '>> cancelled 1'],
    machines: () => [
      scope =>
        scope.onLatest(is('L'), ({ n }, worker) => {
          worker.finally(isCancelled => isCancelled && worker.put({ type: `cancelled ${n}` }));
          worker.take(is('NEVER'), () => undefined);
        })
    ],
    script: dispatch => {
      dispatch({ n: 1, type: 'L' });
      dispatch({ n: 2, type: 'L' });
    }
  },
  'a fork after a promise: the child puts before the parent goes on': {
    expected: ['> P', '> CHILD', '> PARENT'],
    machines: () => [
      scope =>
        scope.take(is('P'), () =>
          scope.wait(Promise.resolve(), () => {
            scope.fork(child => child.put({ type: 'CHILD' }));
            scope.put({ type: 'PARENT' });
          })
        )
    ],
    script: dispatch => {
      dispatch({ type: 'P' });
    }
  },
  'a put forked outside a task runs once the fork returns': {
    expected: ['> P', 'the child goes on', 'the parent goes on', '> FORKED_PUT'],
    machines: log => [
      scope =>
        scope.take(is('P'), () =>
          scope.wait(Promise.resolve(), () => {
            scope.fork(child => {
              child.fork(grandchild => grandchild.put({ type: 'FORKED_PUT' }));
              log('the child goes on');
            });
            log('the parent goes on');
          })
        )
    ],
    script: dispatch => {
      dispatch({ type: 'P' });
    }
  },
  'an uncaught error: the failing one stops first, then every other in order, then onError, then their puts': {
    expected: [
      '> START',
      '> GO',
      '>> REDUCER_THROWS',
      'threw reducer',
      'failing finally, cancelled: false',
      'first finally, cancelled: true',
      'third finally, cancelled: true',
      'onError reducer',
      '>> SAGA_ERROR',
      '>> FIRST_CANCELLED',
      '>> THIRD_CANCELLED',
      '> AFTER'
    ],
    machines: log => [
      scope =>
        scope.on(is('START'), (_, worker) => {
          worker.finally(isCancelled => {
            log(`first finally, cancelled: ${isCancelled}`);
            isCancelled && worker.put({ type: 'FIRST_CANCELLED' });
          });
          worker.take(is('NEVER'), () => undefined);
        }),
      scope =>
        scope.on(is('GO'), (_, worker) => {
          worker.finally(isCancelled => log(`failing finally, cancelled: ${isCancelled}`));
          worker.put({ type: 'REDUCER_THROWS' });
        }),
      scope =>
        scope.on(is('START'), (_, worker) => {
          worker.finally(isCancelled => {
            log(`third finally, cancelled: ${isCancelled}`);
            isCancelled && worker.put({ type: 'THIRD_CANCELLED' });
          });
          worker.take(is('NEVER'), () => undefined);
        })
    ],
    script: dispatch => {
      dispatch({ type: 'START' });
      dispatch({ type: 'GO' });
      dispatch({ type: 'AFTER' });
    }
  },
  'an uncaught error outside a task: what the others put while stopping runs before onError': {
    expected: ['> START', '> GO', '> CLEANUP', 'onError boom', '> SAGA_ERROR'],
    machines: () => [
      scope =>
        scope.take(is('START'), () => {
          scope.finally(() => scope.fork(child => child.put({ type: 'CLEANUP' })));
          scope.take(is('NEVER'), () => undefined);
        }),
      scope =>
        scope.take(is('GO'), () =>
          scope.wait(Promise.resolve(), () => {
            throw new Error('boom');
          })
        )
    ],
    script: dispatch => {
      dispatch({ type: 'START' });
      dispatch({ type: 'GO' });
    }
  },
  'an external action the reducer throws on goes to the caller, and no taker gets it': {
    expected: ['> REDUCER_THROWS', 'threw reducer', 'script threw reducer'],
    machines: () => [scope => scope.on(is('REDUCER_THROWS'), (_, worker) => worker.put({ type: 'TOOK' }))],
    script: dispatch => {
      dispatch({ type: 'REDUCER_THROWS' });
    }
  },
  'a put caught by its machine goes on': {
    expected: [
      '> GO',
      '>> REDUCER_THROWS',
      'threw reducer',
      '>> caught reducer',
      '> GO',
      '>> REDUCER_THROWS',
      'threw reducer',
      '>> caught reducer'
    ],
    machines: () => [
      scope =>
        scope.on(is('GO'), (_, worker) =>
          worker.put(
            { type: 'REDUCER_THROWS' },
            () => worker.put({ type: 'NOT_HERE' }),
            error => worker.put({ type: `caught ${(error as Error).message}` })
          )
        )
    ],
    script: dispatch => {
      dispatch({ type: 'GO' });
      dispatch({ type: 'GO' });
    }
  },
  'an observable: one value at a time, each a microtask after the work of the one before': {
    expected: ['> SUBSCRIBE', '> value 1', '> BETWEEN', '> value 2', '> value 3'],
    machines: log => [
      scope =>
        scope.take(is('SUBSCRIBE'), () => {
          let next: (value: number) => void;

          scope.observeEach(
            {
              subscribe: observer => {
                ({ next } = observer);
                next(1);

                return { unsubscribe: () => log('unsubscribe') };
              }
            },
            (value: number, done) => {
              value === 1 && (next(2), next(3));
              scope.put({ type: `value ${value}` }, done);
            }
          );
        })
    ],
    script: async dispatch => {
      dispatch({ type: 'SUBSCRIBE' });
      await Promise.resolve();
      dispatch({ type: 'BETWEEN' });
    }
  }
};

test.each(Object.keys(CASES))('%s: the machines do what redux-saga did', async name => {
  // eslint-disable-next-line security/detect-object-injection
  const entry = CASES[name];

  expect(await run(entry)).toEqual(entry.expected);
});
