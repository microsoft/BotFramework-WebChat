/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

import { Constants, createStore, version } from 'botframework-webchat-core';

import ReactWebChat, {
  Components,
  concatMiddleware,
  connectToWebChat,
  createStyleSet
} from 'botframework-webchat-component';

import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfillFactory from './createBrowserWebSpeechPonyfillFactory';
import defaultCreateDirectLine from './createDirectLine';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);
const createDirectLine = options => defaultCreateDirectLine({ botAgent: `webchat-minimal/${version}`, ...options });

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
  renderWebChat,
  version
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
