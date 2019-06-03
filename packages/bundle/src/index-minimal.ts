/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

import { Constants, createStore } from 'botframework-webchat-core';

import ReactWebChat, {
  Components,
  concatMiddleware,
  connectToWebChat,
  createStyleSet
} from 'botframework-webchat-component';

import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfillFactory from './createBrowserWebSpeechPonyfillFactory';
import createDirectLine from './createDirectLine';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export default ReactWebChat;

export {
  Components,
  concatMiddleware,
  connectToWebChat,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createStore,
  createStyleSet,
  renderWebChat
};

window['WebChat'] = {
  ...window['WebChat'],
  concatMiddleware,
  connectToWebChat,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createStore,
  createStyleSet,
  ReactWebChat,
  renderWebChat
};

addVersion('minimal');
