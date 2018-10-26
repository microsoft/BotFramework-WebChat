import React from 'react';

import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import dispatchIncomingActivityMiddleware from './dispatchIncomingActivityMiddleware';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.store = createStore(
      {},
      dispatchIncomingActivityMiddleware(props.appDispatch)
    );

    this.state = {};
  }

  componentDidMount() {
    this.fetchToken();
    this.setSendBox();
  }

  async fetchToken() {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
    const { token } = await res.json();

    this.setState(() => ({
      directLine: createDirectLine({ token })
    }));
  }

  setSendBox() {
    this.store.dispatch({
      type: 'WEB_CHAT/SET_SEND_BOX',
      payload: { text: 'sample:redux-middleware' }
    });
  }

  render() {
    return (
      this.state.directLine ?
        <ReactWebChat
          className="chat"
          directLine={ this.state.directLine }
          store={ this.store }
          styleOptions={{
            backgroundColor: 'Transparent'
          }}
        />
      :
        <div>Connecting to bot&hellip;</div>
    );
  }
}
