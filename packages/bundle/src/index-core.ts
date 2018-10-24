import {
  Constants,
  createStore
} from 'botframework-webchat-core';

import ReactWebChat, {
  Components,
  concatMiddleware,
  connectWithContext,
  createStyleSet
} from 'botframework-webchat-component';

import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfillFactory from './createBrowserWebSpeechPonyfillFactory';
import createDirectLine from './createDirectLine';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat)

export default ReactWebChat

export {
  Components,
  Constants,
  concatMiddleware,
  connectWithContext,
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
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createStore,
  createStyleSet,
  renderWebChat,
  ReactWebChat
};
