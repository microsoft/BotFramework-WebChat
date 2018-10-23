import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import { createProvider } from 'react-redux';
import { createStore } from 'botframework-webchat';

const WebChatProvider = createProvider('webchat');
const store = createStore();

ReactDOM.render(
  <WebChatProvider store={ store }>
    <App />
  </WebChatProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
