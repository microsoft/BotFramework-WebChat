import { createProvider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from 'botframework-webchat-core';

const REDUX_STORE_KEY = 'webchat';

const Provider = createProvider(REDUX_STORE_KEY);

export default function (ReactWebChat, props, element) {
  const store = createStore();

  ReactDOM.render(
    <Provider store={ store }>
      <ReactWebChat { ...props } storeKey={ REDUX_STORE_KEY } />
    </Provider>,
    element
  );

  return { store };
}
