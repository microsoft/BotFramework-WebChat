import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import { createStore } from 'botframework-webchat-core';
import BasicWebChat from 'botframework-webchat-component';
import renderMarkdown from './renderMarkdown';

export default function (props, element) {
  const store = createStore();

  ReactDOM.render(
    <Provider store={ store }>
      <BasicWebChat
        { ...props }

        renderMarkdown={ renderMarkdown }
      />
    </Provider>,
    element
  );

  return {
    store
  };
}
