import React from 'react';
import { createStore } from 'botframework-webchat';

import SendHistory from './SendHistory';
import ReactWebChat from './WebChat';

export default class App extends React.Component {
  history = new SendHistory();

  store = createStore(
    {},
    () => next => action => {
      if (action.type === 'WEB_CHAT/SEND_MESSAGE') {
        // add to history
        this.history.add(action.payload.text);
      } else if (!action.fromHistory && action.type === 'WEB_CHAT/SET_SEND_BOX') {
        // sendbox was modified by the user, not history
        this.history.reset();
      }

      return next(action);
    }
  )

  render() {
    return (
      <div className="app" onKeyDown={ this.handleKeyDown }>
        <ReactWebChat store={ this.store } />
      </div>
    )
  }

  handleKeyDown = (e) => {
    const { target } = e;

    if (target.dataset.id === 'webchat-sendbox-input') {
      let text;

      switch (e.key) {
        case 'ArrowUp':
          if (target.selectionStart === 0) {
            text = this.history.getNext();
          }
          break;
        case 'ArrowDown':
          if (this.history.isActive()) {
            text = this.history.getPrevious();
          }
          break;
        default:
          return;
      }

      if (typeof text === 'string') {
        this.store.dispatch({
          type: 'WEB_CHAT/SET_SEND_BOX',
          fromHistory: true,
          payload: { text }
        });
      }
    }
  }
}
