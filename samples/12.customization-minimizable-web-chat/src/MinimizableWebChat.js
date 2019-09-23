import React from 'react';
import { createStore, createStyleSet } from 'botframework-webchat';

import WebChat from './WebChat';

import './fabric-icons-inline.css';
import './MinimizableWebChat.css';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleFetchToken = this.handleFetchToken.bind(this);
    this.handleMaximizeButtonClick = this.handleMaximizeButtonClick.bind(this);
    this.handleMinimizeButtonClick = this.handleMinimizeButtonClick.bind(this);
    this.handleSwitchButtonClick = this.handleSwitchButtonClick.bind(this);

    const store = createStore({}, ({ dispatch }) => next => action => {
      if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
        setTimeout(() => {
          dispatch({
            type: 'WEB_CHAT/SEND_EVENT',
            payload: {
              name: 'webchat/join',
              value: {
                language: window.navigator.language
              }
            }
          });
        }, 1000);
      } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
        if (action.payload.activity.from.role === 'bot') {
          this.setState(() => ({ newMessage: true }));
        }
      }

      return next(action);
    });

    this.state = {
      minimized: true,
      newMessage: false,
      side: 'right',
      store,
      styleSet: createStyleSet({
        backgroundColor: 'Transparent'
      }),
      token: null
    };
  }

  async handleFetchToken() {
    if (!this.state.token) {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      this.setState(() => ({ token }));
    }
  }

  handleMaximizeButtonClick() {
    this.setState(() => ({
      minimized: false,
      newMessage: false
    }));
  }

  handleMinimizeButtonClick() {
    this.setState(() => ({
      minimized: true,
      newMessage: false
    }));
  }

  handleSwitchButtonClick() {
    this.setState(({ side }) => ({
      side: side === 'left' ? 'right' : 'left'
    }));
  }

  render() {
    const {
      state: { minimized, newMessage, side, store, styleSet, token }
    } = this;

    return (
      <div className="minimizable-web-chat">
        {minimized ? (
          <button className="maximize" onClick={this.handleMaximizeButtonClick}>
            <span className={token ? 'ms-Icon ms-Icon--MessageFill' : 'ms-Icon ms-Icon--Message'} />
            {newMessage && <span className="ms-Icon ms-Icon--CircleShapeSolid red-dot" />}
          </button>
        ) : (
          <div className={side === 'left' ? 'chat-box left' : 'chat-box right'}>
            <header>
              <div className="filler" />
              <button className="switch" onClick={this.handleSwitchButtonClick}>
                <span className="ms-Icon ms-Icon--Switch" />
              </button>
              <button className="minimize" onClick={this.handleMinimizeButtonClick}>
                <span className="ms-Icon ms-Icon--ChromeMinimize" />
              </button>
            </header>
            <WebChat
              className="react-web-chat"
              onFetchToken={this.handleFetchToken}
              store={store}
              styleSet={styleSet}
              token={token}
            />
          </div>
        )}
      </div>
    );
  }
}
