import { Provider } from 'react-redux';
import { BasicWebChat } from 'component';
import ReactDOM from 'react-dom';

import { createStore } from 'backend';
import renderMarkdown from './renderMarkdown';

export default function (bundleProps, props, element) {
  const store = createStore();

  ReactDOM.render(
    <Provider store={ store }>
      <BasicWebChat
        { ...bundleProps }
        { ...props }

        attachmentMiddleware={ [
          ...props.attachmentMiddleware || [],
          ...bundleProps.attachmentMiddleware || []
        ] }

        renderMarkdown={ renderMarkdown }
      />
    </Provider>,
    element
  );

  return {
    store
  };
}
