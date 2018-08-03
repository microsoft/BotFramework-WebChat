import { css } from 'glamor';
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import { createStore } from 'backend';

import App from './App';
import SpeechOnlyButtonApp from './SpeechOnlyButton/index';

css.global('html, body, #root', { height: '100%' });
css.global('body', { margin: 0 });

if (/speech-only-button(\.html)?/.test(window.location.href)) {
  ReactDOM.render(<SpeechOnlyButtonApp />, document.getElementById('root'));
} else {
  const store = createStore();

  ReactDOM.render(
    <Provider store={ store }>
      <App />
    </Provider>,
  document.getElementById('root'));
}

registerServiceWorker();
