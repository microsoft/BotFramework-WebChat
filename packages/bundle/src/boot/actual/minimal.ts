import buildInfo from '../../buildInfo';

// #region Build info
buildInfo.set('variant', 'minimal');

const { object: buildInfoObject, version } = buildInfo;
// #endregion

export { concatMiddleware, createStyleSet, testIds, withEmoji } from 'botframework-webchat-component';
export { Constants, createStore, createStoreWithDevTools, createStoreWithOptions } from 'botframework-webchat-core';
export { default as createBrowserWebSpeechPonyfillFactory } from '../../createBrowserWebSpeechPonyfillFactory';
export { ReactWebChat, type ReactWebChatProps } from './component/minimal';
export { default as createDirectLine } from './private/createDirectLine';
export { default as createDirectLineAppServiceExtension } from './private/createDirectLineAppServiceExtension';
export { renderWebChat } from './renderWebChat/minimal';
export { type StrictStyleOptions, type StyleOptions } from './styleOptions/minimal';
export { buildInfoObject as buildInfo, version };
