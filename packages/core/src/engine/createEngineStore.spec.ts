// The engine store, pinned to Redux 5.0.1: each case runs once on Redux's `createStore()` and once on
// `createEngineStore()`, both with Redux's `applyMiddleware()`. Both must log the same lines, error messages in full, and
// the first 2 sentences of each line must read as written below.
import { applyMiddleware, createStore, type Middleware, type StoreEnhancerStoreCreator } from 'redux';

import { createWebChatEngine } from '../createStore';
import createEngineStore, { type EngineStore } from './createEngineStore';

type TestAction = { readonly type: string; readonly value?: string };
type TestState = { readonly value: string };

type CreateOptions = {
  readonly middlewares?: readonly Middleware[] | undefined;
  readonly onReduce?: ((action: TestAction) => void) | undefined;
  readonly preloadedState?: TestState | undefined;
};

type Case = {
  readonly expected: readonly string[];
  readonly run: (create: (options?: CreateOptions) => EngineStore<TestState>, log: (line: string) => void) => void;
};

function run(kind: 'engine' | 'redux', { run }: Case): string[] {
  const lines: string[] = [];
  const log = (line: string) => lines.push(line);

  run(({ middlewares = [], onReduce, preloadedState } = {}) => {
    const reducer = (state: TestState = { value: '' }, action: TestAction): TestState => {
      log(`reduce ${action.type.startsWith('@@redux/INIT') ? 'INIT' : action.type}`);
      onReduce?.(action);

      return action.type === 'SET' ? { value: action.value } : state;
    };

    return kind === 'redux'
      ? createStore(reducer, preloadedState, applyMiddleware(...middlewares))
      : applyMiddleware(...middlewares)(createEngineStore as StoreEnhancerStoreCreator)(reducer, preloadedState);
  }, log);

  return lines;
}

// Logs "<label>: ok" or "<label>: <error message>".
function attempt(log: (line: string) => void, label: string, fn: () => unknown): void {
  try {
    fn();
    log(`${label}: ok`);
  } catch (error) {
    log(`${label}: ${error.message}`);
  }
}

const set = (value: string): TestAction => ({ type: 'SET', value });

// Logs "<label> <type>" for every action it gets.
const logTypes =
  (log: (line: string) => void, label: string): Middleware =>
  () =>
  next =>
  action => {
    log(`${label} ${(action as TestAction).type}`);

    return next(action);
  };

const CASES: Readonly<Record<string, Case>> = {
  'reduces INIT once at creation, unseen by middleware and listeners': {
    expected: ['reduce INIT', 'state preloaded'],
    run: (create, log) => {
      const store = create({
        middlewares: [logTypes(log, 'middleware')],
        preloadedState: { value: 'preloaded' }
      });

      store.subscribe(() => log('listener'));
      log(`state ${store.getState().value}`);
    }
  },
  'returns the dispatched action itself without middleware': {
    expected: ['reduce INIT', 'reduce SET', 'same object: true'],
    run: (create, log) => {
      const action = set('1');

      log(`same object: ${create().dispatch(action) === action}`);
    }
  },
  'notifies a nested dispatch to every listener before the outer round goes on': {
    expected: ['reduce INIT', 'reduce SET', 'A1', 'reduce SET', 'A2', 'B2', 'A returned', 'B2', 'returned 1'],
    run: (create, log) => {
      const store = create();
      let nested = false;

      store.subscribe(() => {
        log(`A${store.getState().value}`);

        if (!nested) {
          nested = true;
          store.dispatch(set('2'));
          log('A returned');
        }
      });

      store.subscribe(() => log(`B${store.getState().value}`));
      log(`returned ${store.dispatch(set('1')).value}`);
    }
  },
  'notifies the listeners of the snapshot taken after the reduce': {
    expected: ['reduce INIT', 'reduce SET', 'a1', 'b1', 'reduce SET', 'a2', 'late2', 'reduce SET', 'a3', 'late3'],
    run: (create, log) => {
      const store = create();
      let changed = false;
      // eslint-disable-next-line prefer-const
      let unsubscribeB: () => void;

      store.subscribe(() => {
        log(`a${store.getState().value}`);

        if (!changed) {
          changed = true;
          store.subscribe(() => log(`late${store.getState().value}`));
          unsubscribeB();
        }
      });

      unsubscribeB = store.subscribe(() => log(`b${store.getState().value}`));

      store.dispatch(set('1'));
      store.dispatch(set('2'));

      // Unsubscribing twice is a no-op.
      unsubscribeB();

      const unsubscribe = store.subscribe(() => log('x'));

      unsubscribe();
      unsubscribe();
      store.dispatch(set('3'));
    }
  },
  'commits the state and skips later listeners and middleware when a listener throws': {
    expected: ['reduce INIT', 'reduce SET', 'dispatch: listener', 'state 1'],
    run: (create, log) => {
      const store = create({
        middlewares: [
          () => next => action => {
            const result = next(action);

            log('after next');

            return result;
          }
        ]
      });

      store.subscribe(() => {
        throw new Error('listener');
      });

      store.subscribe(() => log('later'));
      attempt(log, 'dispatch', () => store.dispatch(set('1')));
      log(`state ${store.getState().value}`);
    }
  },
  'keeps the state object and notifies no one when the reducer throws': {
    expected: [
      'reduce INIT',
      'same object between dispatches: true',
      'reduce THROW',
      'dispatch: reducer',
      'same object after the throw: true',
      'reduce SET',
      'listener 2'
    ],
    run: (create, log) => {
      const store = create({
        onReduce: ({ type }) => {
          if (type === 'THROW') {
            throw new Error('reducer');
          }
        }
      });

      const before = store.getState();

      store.subscribe(() => log(`listener ${store.getState().value}`));
      log(`same object between dispatches: ${store.getState() === before}`);
      attempt(log, 'dispatch', () => store.dispatch({ type: 'THROW' }));
      log(`same object after the throw: ${store.getState() === before}`);
      store.dispatch(set('2'));
    }
  },
  'rejects what is not an action, and a listener that is not a function': {
    expected: [
      'reduce INIT',
      "undefined: Actions must be plain objects. Instead, the actual type was: 'undefined'",
      "null: Actions must be plain objects. Instead, the actual type was: 'null'",
      "function: Actions must be plain objects. Instead, the actual type was: 'function'",
      "array: Actions must be plain objects. Instead, the actual type was: 'array'",
      "class instance: Actions must be plain objects. Instead, the actual type was: 'object'",
      '{}: Actions may not have an undefined "type" property. You may have misspelled an action type string constant.',
      'type 1: Action "type" property must be a string. Instead, the actual type was: \'number\'',
      "subscribe a string: Expected the listener to be a function. Instead, received: 'string'",
      'state unchanged: true',
      'reduce SET',
      'null prototype: ok'
    ],
    run: (create, log) => {
      const store = create();
      const before = store.getState();

      for (const [label, action] of [
        ['undefined', undefined],
        ['null', null],
        ['function', () => undefined],
        ['array', []],
        ['class instance', new (class Thing {})()],
        ['{}', {}],
        ['type 1', { type: 1 }]
      ] as const) {
        attempt(log, label, () => store.dispatch(action as any));
      }

      attempt(log, 'subscribe a string', () => store.subscribe('x' as any));
      log(`state unchanged: ${store.getState() === before}`);
      attempt(log, 'null prototype', () => store.dispatch(Object.assign(Object.create(null), set('1'))));
    }
  },
  'names the kind of what is not an action as Redux does': {
    expected: [
      'reduce INIT',
      "Promise: Actions must be plain objects. Instead, the actual type was: 'Promise'",
      "Date: Actions must be plain objects. Instead, the actual type was: 'date'",
      "Error: Actions must be plain objects. Instead, the actual type was: 'error'",
      "Map: Actions must be plain objects. Instead, the actual type was: 'Map'",
      "Set: Actions must be plain objects. Instead, the actual type was: 'Set'",
      "WeakMap: Actions must be plain objects. Instead, the actual type was: 'WeakMap'",
      "RegExp: Actions must be plain objects. Instead, the actual type was: 'regexp'",
      "Uint8Array: Actions must be plain objects. Instead, the actual type was: 'uint8array'",
      "symbol: Actions must be plain objects. Instead, the actual type was: 'symbol'",
      'type null: Action "type" property must be a string. Instead, the actual type was: \'null\'',
      'type Date: Action "type" property must be a string. Instead, the actual type was: \'date\'',
      // A TypeError from stringifying the symbol into the message.
      'type symbol: Cannot convert a Symbol value to a string'
    ],
    run: (create, log) => {
      const date = new Date(0);
      const store = create();

      for (const [label, action] of [
        ['Promise', Promise.resolve(set('1'))],
        ['Date', date],
        ['Error', new Error('1')],
        ['Map', new Map()],
        ['Set', new Set()],
        ['WeakMap', new WeakMap()],
        ['RegExp', /1/u],
        ['Uint8Array', new Uint8Array()],
        ['symbol', Symbol('1')],
        ['type null', { type: null }],
        ['type Date', { type: date }],
        ['type symbol', { type: Symbol('1') }]
      ] as const) {
        attempt(log, label, () => store.dispatch(action as any));
      }
    }
  },
  'throws when the reducer calls the store': {
    expected: [
      'reduce INIT',
      'reduce CALL',
      'dispatch: Reducers may not dispatch actions.',
      'getState: You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument',
      'subscribe: You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state',
      'unsubscribe: You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.',
      'listener'
    ],
    run: (create, log) => {
      // eslint-disable-next-line prefer-const
      let unsubscribe: () => void;

      const store = create({
        onReduce: ({ type }) => {
          if (type === 'CALL') {
            attempt(log, 'dispatch', () => store.dispatch(set('1')));
            attempt(log, 'getState', () => store.getState());
            attempt(log, 'subscribe', () => store.subscribe(() => undefined));
            attempt(log, 'unsubscribe', unsubscribe);
          }
        }
      });

      unsubscribe = store.subscribe(() => log('listener'));
      store.dispatch({ type: 'CALL' });
    }
  }
};

const firstTwoSentences = (line: string) => line.split('. ').slice(0, 2).join('. ');

describe.each(Object.entries(CASES))('An engine store %s', (_, testCase) => {
  test('as Redux does', () => {
    const redux = run('redux', testCase);

    expect(run('engine', testCase)).toEqual(redux);
    expect(redux.map(firstTwoSentences)).toEqual(testCase.expected);
  });
});

test('The store of createWebChatEngine() has dispatch, getState and subscribe as its own enumerable properties, and is frozen', () => {
  const store = createWebChatEngine({});

  // `GraphProvider` gets `{ ...store, subscribe }`.
  expect(Object.keys({ ...store }).sort()).toEqual(['dispatch', 'getState', 'subscribe']);
  expect(Object.isFrozen(store)).toBe(true);
});
