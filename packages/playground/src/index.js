import { css } from 'glamor';
import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';

import App from './App';
import SpoeechOnlyButtonApp from './SpeechOnlyButton/index';

css.global('html, body, #root', { height: '100%' });
css.global('body', { margin: 0 });

if (/speech-only-button(\.html)?/.test(window.location.href)) {
  ReactDOM.render(<SpoeechOnlyButtonApp />, document.getElementById('root'));
} else {
  ReactDOM.render(<App />, document.getElementById('root'));
}

registerServiceWorker();
