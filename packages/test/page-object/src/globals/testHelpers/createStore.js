import getTestEngine, { getWebChatInternal, noteTestStore } from './webChatEngine';

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
  // With the "webchat" engine: the same store contract, without Redux.
  const create =
    getTestEngine() === 'webchat' ? getWebChatInternal()?.createWebChatEngine : window.WebChat.createStoreWithOptions;

  if (typeof create !== 'function') {
    throw new Error('WebChatTest: The "webchat" engine needs `createWebChatEngine` of the internal entry of Web Chat.');
  }

  const createdStore = create(
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

  noteTestStore(createdStore);

  return createdStore;
}

export default function createStore(initialState = {}, ...middleware) {
  return createStoreWithOptions({}, initialState, ...middleware);
}

function dispatch(...args) {
  if (!activeStore) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return activeStore.dispatch(...args);
}

function getActionHistory() {
  if (!actionHistory) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return actionHistory;
}

function getState() {
  if (!activeStore) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return activeStore.getState();
}

export { createStoreWithOptions, dispatch, getActionHistory, getState };
