import { createProvider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from '@webchattest/botframework-webchat-core';

const REDUX_STORE_KEY = 'webchat';

const WebChatProvider = createProvider(REDUX_STORE_KEY);

export default function (ReactWebChat, props, element) {
  const store = createStore();

  ReactDOM.render(
    <WebChatProvider store={ store }>
      <ReactWebChat { ...props } storeKey={ REDUX_STORE_KEY } />
    </WebChatProvider>,
    element
  );

  return { store };
}
