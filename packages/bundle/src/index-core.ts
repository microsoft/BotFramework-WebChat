import { createStore } from 'backend';
import ReactWebChat from 'component';

import createDirectLine from './createDirectLine';
import renderWebChat from './renderWebChat';

export default renderWebChat.bind(null, ReactWebChat)

export {
  createDirectLine,
  createStore,
  ReactWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  createDirectLine,
  createStore,
  renderWebChat,
  ReactWebChat
};
