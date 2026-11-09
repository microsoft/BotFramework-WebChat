import getStoreMode, { ReduxOnlyTest } from './storeMode';

let actionHistory;
let activeStore;

function concatMiddleware(...middlewares) {
  return options => {
    const setup = middlewares.reduce((setup, middleware) => (middleware ? [...setup, middleware(options)] : setup), []);

    return last => {
      const stack = setup.slice();
      const work =
        index =>
        (...args) => {
          const next = stack[+index];

          return (next ? next(work(index + 1)) : last)(...args);
        };

      return work(0);
    };
  };
}

function createStoreWithOptions(options = {}, initialState = {}, ...middleware) {
  if (getStoreMode() === 'default') {
    if (Object.keys(initialState || {}).length || middleware.some(Boolean)) {
      throw new ReduxOnlyTest('initial state and store middleware need a Redux store.');
    }

    actionHistory = undefined;
    activeStore = undefined;

    // Web Chat without a store runs on the default providers.
    return undefined;
  }

  return window.WebChat.createStoreWithOptions(
    options,
    initialState,
    concatMiddleware(
      store => {
        actionHistory = [];
        activeStore = store;

        return next => action => {
          actionHistory.push(action);

          return next(action);
        };
      },
      ...middleware
    )
  );
}

export default function createStore(initialState = {}, ...middleware) {
  return createStoreWithOptions({}, initialState, ...middleware);
}

function throwInDefaultMode(name) {
  if (getStoreMode() === 'default') {
    throw new ReduxOnlyTest(`${name}() needs a Redux store.`);
  }
}

function dispatch(...args) {
  throwInDefaultMode('dispatch');

  if (!activeStore) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return activeStore.dispatch(...args);
}

function getActionHistory() {
  throwInDefaultMode('getActionHistory');

  if (!actionHistory) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return actionHistory;
}

function getState() {
  throwInDefaultMode('getState');

  if (!activeStore) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return activeStore.getState();
}

export { createStoreWithOptions, dispatch, getActionHistory, getState };
