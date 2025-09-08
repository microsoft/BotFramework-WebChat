import * as apiDecorator from 'botframework-webchat-api/decorator';
import ReactWebChat from 'botframework-webchat-component';
import * as componentDecorator from 'botframework-webchat-component/decorator';
import * as internal from 'botframework-webchat-component/internal';

import defaultCreateDirectLine from '../../createDirectLine';
import defaultCreateDirectLineAppServiceExtension from '../../createDirectLineAppServiceExtension';
import coreRenderWebChat from '../../renderWebChat';
import buildInfo from '../buildInfo';

buildInfo.set('variant', 'minimal');

const { object: buildInfoObject, version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

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

// #region Re-exports
export { type StrictStyleOptions, type StyleOptions } from 'botframework-webchat-api';
export {
  Components,
  concatMiddleware,
  createStyleSet,
  hooks,
  testIds,
  withEmoji
} from 'botframework-webchat-component';
export { Constants, createStore, createStoreWithDevTools, createStoreWithOptions } from 'botframework-webchat-core';
export { default as createBrowserWebSpeechPonyfillFactory } from '../../createBrowserWebSpeechPonyfillFactory';
// #endregion

// #region Local exports
export default ReactWebChat;

export {
  buildInfoObject as buildInfo,
  createDirectLine,
  createDirectLineAppServiceExtension,
  decorator,
  internal,
  ReactWebChat,
  renderWebChat,
  version
};
// #endregion
