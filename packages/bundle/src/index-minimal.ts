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

export const createDirectLine = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );
  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Minimal)` });
};

export default ReactWebChat;

export {
  Components,
  concatMiddleware,
  connectToWebChat,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
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
