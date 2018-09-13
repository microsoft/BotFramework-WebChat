import { createStore } from 'backend';
import ReactWebChat from 'component';

import createDirectLine from './createDirectLine';
import coreRenderWebChat from './renderWebChat';

const renderWebChat = coreRenderWebChat .bind(null, ReactWebChat)

export default ReactWebChat

export {
  createDirectLine,
  createStore,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  createDirectLine,
  createStore,
  renderWebChat,
  ReactWebChat
};
