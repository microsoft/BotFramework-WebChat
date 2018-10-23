import { createStore } from 'botframework-webchat-core';
import ReactWebChat, {
  Components,
  concatMiddleware,
  connectWithContext,
  // TODO: [P2] Remove Context
  Context,
  createStyleSet
} from 'botframework-webchat-component';

import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfillFactory from './createBrowserWebSpeechPonyfillFactory';
import createDirectLine from './createDirectLine';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat)

export default ReactWebChat

export {
  Components,
  concatMiddleware,
  connectWithContext,
  Context,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createStore,
  createStyleSet,
  renderWebChat
}

window['WebChat'] = {
  ...window['WebChat'],
  concatMiddleware,
  connectWithContext,
  Context,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createStore,
  createStyleSet,
  renderWebChat,
  ReactWebChat
};
