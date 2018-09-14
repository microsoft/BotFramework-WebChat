import { createStore } from 'backend';
import ReactWebChat, { concatMiddleware, Context } from 'component';

import createDirectLine from './createDirectLine';
import coreRenderWebChat from './renderWebChat';

const renderWebChat = coreRenderWebChat .bind(null, ReactWebChat)

export default ReactWebChat

export {
  concatMiddleware,
  Context,
  createDirectLine,
  createStore,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  concatMiddleware,
  Context,
  createDirectLine,
  createStore,
  renderWebChat,
  ReactWebChat
};
