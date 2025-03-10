/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import { initializeIcons } from '@fluentui/react';
import onErrorResumeNext from 'on-error-resume-next';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { createStoreWithDevTools } from 'botframework-webchat';

// eslint-disable-next-line no-unused-vars
import App from './App';

initializeIcons(); // @fluentui icons

const REDUX_STORE_KEY = 'REDUX_STORE';
// eslint-disable-next-line prefer-const
let store;

window.addEventListener('keydown', event => {
  const { ctrlKey, key } = event;

  if (ctrlKey && (key === 'r' || key === 'R')) {
    // CTRL-R
    sessionStorage.removeItem(REDUX_STORE_KEY);
  } else if (ctrlKey && (key === 's' || key === 'S')) {
    // CTRL-S
    event.preventDefault();
    // eslint-disable-next-line no-console
    store && console.log(store.getState());
  }
});

store = createStoreWithDevTools(
  onErrorResumeNext(() => JSON.parse(window.sessionStorage.getItem(REDUX_STORE_KEY))),
  ({ dispatch }) => next => action => {
    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      dispatch({
        type: 'WEB_CHAT/SEND_EVENT',
        payload: { name: 'webchat/join', value: { language: window.navigator.language } }
      });
    }

    return next(action);
  }
);

store.subscribe(() => {
  sessionStorage.setItem(REDUX_STORE_KEY, JSON.stringify(store.getState()));
});

ReactDOM.render(<App store={store} />, document.getElementById('root'));

registerServiceWorker();
