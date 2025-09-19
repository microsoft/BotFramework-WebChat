import ReactWebChat from 'botframework-webchat-component';

import buildInfo from '../../buildInfo';
import coreRenderWebChat from '../../renderWebChat';
import createDirectLine from './private/createDirectLine';
import createDirectLineAppServiceExtension from './private/createDirectLineAppServiceExtension';

buildInfo.set('variant', 'minimal');

const { object: buildInfoObject, version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

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
  ReactWebChat,
  renderWebChat,
  version
};
// #endregion
