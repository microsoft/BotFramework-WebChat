import { css } from 'glamor';
import { Provider } from 'react-redux';
import onErrorResumeNext from 'on-error-resume-next';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'backend';

import App from './App';
import SpeechOnlyButtonApp from './SpeechOnlyButton/index';

css.global('html, body, #root', { height: '100%' });
css.global('body', { margin: 0 });

const REDUX_STORE_KEY = 'REDUX_STORE';

if (/speech-only-button(\.html)?/.test(window.location.href)) {
  ReactDOM.render(<SpeechOnlyButtonApp />, document.getElementById('root'));
} else {
  const store = createStore(
    onErrorResumeNext(() => JSON.parse(window.sessionStorage.getItem(REDUX_STORE_KEY)))
  );

  store.subscribe(() => {
    sessionStorage.setItem(REDUX_STORE_KEY, JSON.stringify(store.getState()));
  });

  ReactDOM.render(
    <Provider store={ store }>
      <App />
    </Provider>,
  document.getElementById('root'));
}

window.addEventListener('keydown', ({ ctrlKey, keyCode }) => {
  if (ctrlKey && keyCode === 82) {
    sessionStorage.removeItem(REDUX_STORE_KEY);
  }
});

registerServiceWorker();
