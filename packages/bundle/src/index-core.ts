import { createStore } from 'botframework-webchat-core';
import ReactWebChat, {
  Components,
  concatMiddleware,
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
  Context,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createStore,
  createStyleSet,
  renderWebChat,
  ReactWebChat
};
