import {
  activityComponent,
  createActivityPolyMiddleware,
  type StrictStyleOptions,
  type StyleOptions
} from 'botframework-webchat-api';
import * as apiDecorator from 'botframework-webchat-api/decorator';
import * as componentDecorator from 'botframework-webchat-component/decorator';
import * as internal from 'botframework-webchat-component/internal';
import { Constants, createStore, createStoreWithDevTools, createStoreWithOptions } from 'botframework-webchat-core';

import ReactWebChat, {
  Components,
  concatMiddleware,
  createStyleSet,
  hooks,
  testIds,
  withEmoji
} from 'botframework-webchat-component';

import createBrowserWebSpeechPonyfillFactory from '../../createBrowserWebSpeechPonyfillFactory';
import defaultCreateDirectLine from '../../createDirectLine';
import defaultCreateDirectLineAppServiceExtension from '../../createDirectLineAppServiceExtension';
import coreRenderWebChat from '../../renderWebChat';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

const buildTool = process.env.build_tool;
const moduleFormat = process.env.module_format;
const version = process.env.npm_package_version;

const buildInfo = Object.freeze({
  buildTool,
  moduleFormat,
  variant: 'minimal',
  version
});

const createDirectLine = (options: Omit<Parameters<typeof defaultCreateDirectLine>[0], 'botAgent'>) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Minimal)` });
};

const createDirectLineAppServiceExtension = (
  options: Omit<Parameters<typeof defaultCreateDirectLineAppServiceExtension>[0], 'botAgent'>
) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (Minimal)` });
};

const decorator = Object.freeze({
  ...apiDecorator,
  ...componentDecorator
});

export default ReactWebChat;
export {
  activityComponent,
  buildInfo,
  Components,
  concatMiddleware,
  Constants,
  createActivityPolyMiddleware, // TODO: Should we export this under "middleware" object or named exports?
  createBrowserWebSpeechPonyfillFactory,
  createDirectLine,
  createDirectLineAppServiceExtension,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  createStyleSet,
  decorator,
  hooks,
  internal,
  ReactWebChat,
  renderWebChat,
  testIds,
  version,
  withEmoji,
  type StrictStyleOptions,
  type StyleOptions
};
