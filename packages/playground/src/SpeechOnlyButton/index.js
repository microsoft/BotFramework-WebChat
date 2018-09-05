import { createStore, connect as createConnectAction } from 'backend';
import { DirectLine } from 'botframework-directlinejs';
import { Provider } from 'react-redux';
import React from 'react';

import App from './App';

export default class SpeechOnlyButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      store: createStore()
    };
  }

  componentDidMount() {
    this.state.store.dispatch(createConnectAction({
      directLine: new DirectLine({
        domain: 'http://localhost:3001/mock',
        fetch,
        createFormData: attachments => {
          const formData = new FormData();

          attachments.forEach(({ contentType, data, filename, name }) => {
            formData.append(name, new Blob(data, { contentType }), filename);
          });

          return formData;
        },
        webSocket: false
      }),
      userID: 'default-user',
      username: 'User-1'
    }));
  }

  render() {
    const { state } = this;

    return (
      <Provider store={ state.store }>
        <App />
      </Provider>
    );
  }
}
