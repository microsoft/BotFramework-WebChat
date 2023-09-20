/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

import {
  Constants,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  version
} from 'botframework-webchat-core';
import { StrictStyleOptions, StyleOptions } from 'botframework-webchat-api';

import ReactWebChat, {
  Components,
  concatMiddleware,
  connectToWebChat,
  createStyleSet,
  hooks,
  withEmoji
} from 'botframework-webchat-component';

import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createBrowserWebSpeechPonyfillFactory from './createBrowserWebSpeechPonyfillFactory';
import defaultCreateDirectLine from './createDirectLine';
import defaultCreateDirectLineAppServiceExtension from './createDirectLineAppServiceExtension';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export const createDirectLine = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Minimal)` });
};

export const createDirectLineAppServiceExtension = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (Minimal)` });
};

export default ReactWebChat;

export {
  Components,
  concatMiddleware,
  connectToWebChat,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  createStyleSet,
  hooks,
  renderWebChat,
  version,
  withEmoji
};

export type { StyleOptions, StrictStyleOptions };

// Until we have a development-specific bundle, we are not shipping createStoreWithDevTools in bundle.
window['WebChat'] = {
  ...window['WebChat'],
  concatMiddleware,
  connectToWebChat,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createDirectLineAppServiceExtension,
  createStore,
  createStoreWithOptions,
  createStyleSet,
  hooks,
  ReactWebChat,
  renderWebChat,
  withEmoji
};

addVersion('minimal');
