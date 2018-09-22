import { createProvider } from 'react-redux';
import React from 'react';

import ReactWebChat, { createDirectLine, createStore } from 'botframework-webchat';
import dispatchIncomingActivityMiddleware from './dispatchIncomingActivityMiddleware';

const WebChatProvider = createProvider('webchat');

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.webChatCoreStore = createStore(
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
    this.webChatCoreStore.dispatch({
      type: 'INPUT/SET_SEND_BOX',
      payload: { text: 'sample:redux-middleware' }
    });
  }

  render() {
    return (
      <WebChatProvider store={ this.webChatCoreStore }>
        { this.state.directLine ?
            <ReactWebChat
              className="chat"
              directLine={ this.state.directLine }
              storeKey="webchat"
              styleOptions={{
                backgroundColor: 'Transparent'
              }}
            />
          :
            <div>Connecting to bot&hellip;</div>
        }
      </WebChatProvider>
    );
  }
}
