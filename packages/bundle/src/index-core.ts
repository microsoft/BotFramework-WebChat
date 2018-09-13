import { createStore } from 'backend';
import ReactWebChat, { concatMiddleware } from 'component';

import createDirectLine from './createDirectLine';
import coreRenderWebChat from './renderWebChat';

const renderWebChat = coreRenderWebChat .bind(null, ReactWebChat)

export default ReactWebChat

export {
  concatMiddleware,
  createDirectLine,
  createStore,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  concatMiddleware,
  createDirectLine,
  createStore,
  renderWebChat,
  ReactWebChat
};
