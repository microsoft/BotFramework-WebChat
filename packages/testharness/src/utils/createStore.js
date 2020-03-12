let actionHistory;
let lastStore;

function concatMiddleware(...middlewares) {
  return options => {
    const setup = middlewares.reduce((setup, middleware) => (middleware ? [...setup, middleware(options)] : setup), []);

    return last => {
      const stack = setup.slice();
      const work = index => (...args) => {
        const next = stack[index];

        return (next ? next(work(index + 1)) : last)(...args);
      };

      return work(0);
    };
  };
}

export default function(initialState = {}, ...middleware) {
  return window.WebChat.createStore(
    initialState,
    concatMiddleware(store => {
      actionHistory = [];
      lastStore = store;

      return next => action => {
        actionHistory.push(action);

        return next(action);
      };
    }, ...middleware)
  );
}

function getActionHistory() {
  if (!actionHistory) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return actionHistory;
}

function getState() {
  if (!lastStore) {
    throw new Error('WebChatTest: Please use "window.WebChatTest.createStore" when initializing Web Chat.');
  }

  return lastStore.getState();
}

export { getActionHistory, getState };
