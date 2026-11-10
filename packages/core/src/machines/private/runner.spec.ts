/**
 * @jest-environment @happy-dom/jest-environment
 */
// The runner of the machines against redux-saga: each case runs a few sagas, and machines written as their twins, on a
// Redux store, and compares what an outermost middleware sees (with the depth of each dispatch), the errors and what
// the sagas and machines logged themselves.
import { applyMiddleware, createStore, type Middleware } from 'redux';
import createSagaMiddleware, { type Saga } from 'redux-saga';
import { call, cancelled, fork, put, race, take, takeEvery, takeLatest } from 'redux-saga/effects';

import createMachines from '../createMachines';
import type { Machine, MachineAction } from '../types';

type Case = {
  readonly host?: Middleware | undefined;
  readonly machines: (log: (line: string) => void) => readonly Machine[];
  readonly saga: (log: (line: string) => void) => Saga;
  readonly script: (dispatch: (action: MachineAction) => unknown) => Promise<void> | void;
};

const is =
  (...types: string[]) =>
  ({ type }: MachineAction) =>
    types.includes(type);

// eslint-disable-next-line no-restricted-globals
const ponyfill = { clearTimeout, setTimeout } as any;

async function run(engine: 'machines' | 'saga', { host, machines, saga, script }: Case): Promise<string[]> {
  const lines: string[] = [];
  const log = (line: string) => lines.push(line);
  let depth = 0;
  let store: ReturnType<typeof createStore>;

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

  const middlewares = [recorder, ...(host ? [host] : [])];

  if (engine === 'saga') {
    const sagaMiddleware = createSagaMiddleware({ onError });

    store = createStore(reducer, applyMiddleware(...middlewares, sagaMiddleware));
    sagaMiddleware.run(saga(log));
  } else {
    let instance: ReturnType<typeof createMachines>;

    const machinesMiddleware: Middleware = ({ dispatch, getState }) => {
      instance = createMachines({ dispatch, getState, onError, ponyfill }, machines(log));

      return next => action => {
        const result = next(action);

        instance.afterReduce(action as any);

        return result;
      };
    };

    store = createStore(reducer, applyMiddleware(...middlewares, machinesMiddleware));
    instance.start();
  }

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
    saga: log =>
      function* () {
        for (;;) {
          const { first } = yield race({ first: take('X'), second: take(['X', 'Y']) });

          log(first ? 'first' : 'second');
        }
      },
    script: dispatch => {
      dispatch({ type: 'X' });
      dispatch({ type: 'Y' });
      dispatch({ type: 'X' });
    }
  },
  'a put runs after the current action, and the worker goes on after its own put': {
    machines: () => [
      scope => scope.on(is('A'), (_, worker) => worker.put({ type: 'B' }, () => worker.put({ type: 'C' }))),
      scope => scope.on(is('B'), (_, worker) => worker.put({ type: 'D' }))
    ],
    saga: () =>
      function* () {
        yield takeEvery('A', function* () {
          yield put({ type: 'B' });
          yield put({ type: 'C' });
        });
        yield takeEvery('B', function* () {
          yield put({ type: 'D' });
        });
      },
    script: dispatch => {
      dispatch({ type: 'A' });
      dispatch({ type: 'A' });
    }
  },
  'a taker that took an action waits again at the end': {
    machines: () => [
      scope => scope.on(is('X', 'Y'), ({ type }, worker) => worker.put({ type: `first took ${type}` })),
      scope => scope.on(is('Y'), ({ type }, worker) => worker.put({ type: `second took ${type}` }))
    ],
    saga: () =>
      function* () {
        yield takeEvery(['X', 'Y'], function* ({ type }: MachineAction) {
          yield put({ type: `first took ${type}` });
        });
        yield takeEvery('Y', function* ({ type }: MachineAction) {
          yield put({ type: `second took ${type}` });
        });
      },
    script: dispatch => {
      dispatch({ type: 'Y' });
      dispatch({ type: 'X' });
      dispatch({ type: 'Y' });
    }
  },
  'a put cloned by a host middleware is taken after the current task': {
    host: () => next => (action: any) => next(action.type === 'B' ? { ...action } : action),
    machines: () => [
      scope => scope.on(is('A'), (_, worker) => worker.put({ type: 'B' }, () => worker.put({ type: 'C' }))),
      scope => scope.on(is('B'), (_, worker) => worker.put({ type: 'D' }))
    ],
    saga: () =>
      function* () {
        yield takeEvery('A', function* () {
          yield put({ type: 'B' });
          yield put({ type: 'C' });
        });
        yield takeEvery('B', function* () {
          yield put({ type: 'D' });
        });
      },
    script: dispatch => {
      dispatch({ type: 'A' });
    }
  },
  'a host middleware that dispatches inside a put, before passing it on': {
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
    saga: () =>
      function* () {
        yield takeEvery('A', function* () {
          yield put({ type: 'B' });
          yield put({ type: 'C' });
        });
        yield takeEvery(['B', 'FROM_HOST'], function* ({ type }: MachineAction) {
          yield put({ type: `took ${type}` });
        });
      },
    script: dispatch => {
      dispatch({ type: 'A' });
    }
  },
  'a worker that waits for any action does so before its taker waits again': {
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
    saga: log =>
      function* () {
        yield takeEvery('REG', function* ({ n }: MachineAction) {
          log(`start ${n}`);

          const { type } = yield take('*');

          log(`worker ${n} took ${type}`);
        });
      },
    script: dispatch => {
      dispatch({ n: 1, type: 'REG' });
      dispatch({ n: 2, type: 'REG' });
      dispatch({ type: 'OTHER' });
    }
  },
  'the latest stops the one before, which puts in its finally': {
    machines: () => [
      scope =>
        scope.onLatest(is('L'), ({ n }, worker) => {
          worker.finally(isCancelled => isCancelled && worker.put({ type: `cancelled ${n}` }));
          worker.take(is('NEVER'), () => undefined);
        })
    ],
    saga: () =>
      function* () {
        yield takeLatest('L', function* ({ n }: MachineAction) {
          try {
            yield take('NEVER');
          } finally {
            if (yield cancelled()) {
              yield put({ type: `cancelled ${n}` });
            }
          }
        });
      },
    script: dispatch => {
      dispatch({ n: 1, type: 'L' });
      dispatch({ n: 2, type: 'L' });
    }
  },
  'a fork after a promise: the child puts before the parent goes on': {
    machines: () => [
      scope =>
        scope.take(is('P'), () =>
          scope.wait(Promise.resolve(), () => {
            scope.fork(child => child.put({ type: 'CHILD' }));
            scope.put({ type: 'PARENT' });
          })
        )
    ],
    saga: () =>
      function* () {
        yield take('P');
        yield call(() => Promise.resolve());
        yield fork(function* () {
          yield put({ type: 'CHILD' });
        });
        yield put({ type: 'PARENT' });
      },
    script: dispatch => {
      dispatch({ type: 'P' });
    }
  },
  'a put forked outside a task runs once the fork returns': {
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
    saga: log =>
      function* () {
        yield take('P');
        yield call(() => Promise.resolve());
        yield fork(function* () {
          yield fork(function* () {
            yield put({ type: 'FORKED_PUT' });
          });
          log('the child goes on');
        });
        log('the parent goes on');
      },
    script: dispatch => {
      dispatch({ type: 'P' });
    }
  },
  'an uncaught error: the failing one stops first, then every other in order, then onError, then their puts': {
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
    saga: log =>
      function* () {
        yield takeEvery('START', function* () {
          try {
            yield take('NEVER');
          } finally {
            const isCancelled = yield cancelled();

            log(`first finally, cancelled: ${isCancelled}`);

            if (isCancelled) {
              yield put({ type: 'FIRST_CANCELLED' });
            }
          }
        });
        yield takeEvery('GO', function* () {
          try {
            yield put({ type: 'REDUCER_THROWS' });
          } finally {
            log(`failing finally, cancelled: ${yield cancelled()}`);
          }
        });
        yield takeEvery('START', function* () {
          try {
            yield take('NEVER');
          } finally {
            const isCancelled = yield cancelled();

            log(`third finally, cancelled: ${isCancelled}`);

            if (isCancelled) {
              yield put({ type: 'THIRD_CANCELLED' });
            }
          }
        });
      },
    script: dispatch => {
      dispatch({ type: 'START' });
      dispatch({ type: 'GO' });
      dispatch({ type: 'AFTER' });
    }
  },
  'an uncaught error outside a task: what the others put while stopping runs before onError': {
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
    saga: () =>
      function* () {
        yield fork(function* () {
          yield take('START');

          try {
            yield take('NEVER');
          } finally {
            yield fork(function* () {
              yield put({ type: 'CLEANUP' });
            });
          }
        });
        yield fork(function* () {
          yield take('GO');
          yield call(() => Promise.resolve());

          throw new Error('boom');
        });
      },
    script: dispatch => {
      dispatch({ type: 'START' });
      dispatch({ type: 'GO' });
    }
  },
  'an external action the reducer throws on goes to the caller, and no taker gets it': {
    machines: () => [scope => scope.on(is('REDUCER_THROWS'), (_, worker) => worker.put({ type: 'TOOK' }))],
    saga: () =>
      function* () {
        yield takeEvery('REDUCER_THROWS', function* () {
          yield put({ type: 'TOOK' });
        });
      },
    script: dispatch => {
      dispatch({ type: 'REDUCER_THROWS' });
    }
  },
  'a put caught by its machine goes on': {
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
    saga: () =>
      function* () {
        yield takeEvery('GO', function* () {
          try {
            yield put({ type: 'REDUCER_THROWS' });
            yield put({ type: 'NOT_HERE' });
          } catch (error) {
            yield put({ type: `caught ${(error as Error).message}` });
          }
        });
      },
    script: dispatch => {
      dispatch({ type: 'GO' });
      dispatch({ type: 'GO' });
    }
  },
  'an observable: one value at a time, each a microtask after the work of the one before': {
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
    saga: log =>
      function* () {
        yield take('SUBSCRIBE');

        const queue: number[] = [];
        let resolveNext: ((value: number) => void) | undefined;
        const push = (value: number) => {
          if (resolveNext) {
            const resolve = resolveNext;

            resolveNext = undefined;
            resolve(value);
          } else {
            queue.push(value);
          }
        };
        const shift = () =>
          queue.length ? Promise.resolve(queue.shift()) : new Promise<number>(resolve => (resolveNext = resolve));

        push(1);

        try {
          for (;;) {
            const value: number = yield call(shift);

            value === 1 && (push(2), push(3));

            yield put({ type: `value ${value}` });
          }
        } finally {
          log('unsubscribe');
        }
      },
    script: async dispatch => {
      dispatch({ type: 'SUBSCRIBE' });
      await Promise.resolve();
      dispatch({ type: 'BETWEEN' });
    }
  }
};

describe.each(Object.keys(CASES))('%s', name => {
  test('the machines do what the sagas do', async () => {
    // eslint-disable-next-line security/detect-object-injection
    const sagas = await run('saga', CASES[name]);
    // eslint-disable-next-line security/detect-object-injection
    const machines = await run('machines', CASES[name]);

    expect(machines).toEqual(sagas);
    // Not empty: the case ran.
    expect(sagas.length).toBeGreaterThan(1);
  });
});
