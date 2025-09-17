import * as apiDecorator from 'botframework-webchat-api/decorator';
import ReactWebChat from 'botframework-webchat-component';
import * as componentDecorator from 'botframework-webchat-component/decorator';
import * as internal from 'botframework-webchat-component/internal';

import buildInfo from '../../buildInfo';
import coreRenderWebChat from '../../renderWebChat';

buildInfo.set('variant', 'minimal');

const { object: buildInfoObject, version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

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
export { buildInfoObject as buildInfo, decorator, internal, ReactWebChat, renderWebChat, version };
// #endregion
