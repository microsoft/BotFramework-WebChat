import { css } from 'glamor';
import onErrorResumeNext from 'on-error-resume-next';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'botframework-webchat';

import App from './App';

css.global('html, body, #root', { height: '100%' });
css.global('body', { margin: 0 });

const REDUX_STORE_KEY = 'REDUX_STORE';
let store;

window.addEventListener('keydown', event => {
  const { ctrlKey, keyCode } = event;

  if (ctrlKey && keyCode === 82) {
    // CTRL-R
    sessionStorage.removeItem(REDUX_STORE_KEY);
  } else if (ctrlKey && keyCode === 83) {
    // CTRL-S
    event.preventDefault();
    store && console.log(store.getState());
  }
});

store = createStore(
  onErrorResumeNext(() => JSON.parse(window.sessionStorage.getItem(REDUX_STORE_KEY)))
);

store.subscribe(() => {
  sessionStorage.setItem(REDUX_STORE_KEY, JSON.stringify(store.getState()));
});

ReactDOM.render(
  <App store={ store }/>,
  document.getElementById('root')
);

registerServiceWorker();
