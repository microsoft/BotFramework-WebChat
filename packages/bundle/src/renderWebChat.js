import { createProvider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from 'botframework-webchat-core';

const REDUX_STORE_KEY = 'webchat';

const WebChatProvider = createProvider(REDUX_STORE_KEY);

export default function (ReactWebChat, props, element) {
  const {
    store = createStore(),
    ...otherProps
  } = props;

  ReactDOM.render(
    <WebChatProvider store={ store }>
      <ReactWebChat { ...otherProps } storeKey={ REDUX_STORE_KEY } />
    </WebChatProvider>,
    element
  );

  // TODO: [P3] Instead/In addition of exposing the store, we should expose dispatcher, e.g. `sendMessage` etc.
  //       We need to think about what is the scenario in the bundled `renderWebChat`, should the user aware of React/Redux or not
  return { store };
}
