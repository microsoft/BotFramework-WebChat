import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from 'botframework-webchat-core';
import BasicWebChat from 'botframework-webchat-component';

export default function (ReactWebChat, props, element) {
  const store = createStore();

  ReactDOM.render(
    <Provider store={ store }>
      <ReactWebChat { ...props } />
    </Provider>,
    element
  );

  return { store };
}
