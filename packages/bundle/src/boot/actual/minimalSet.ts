import buildInfo from '../../buildInfo';

// #region Build info
buildInfo.set('variant', 'minimal');

const { object: buildInfoObject, version } = buildInfo;
// #endregion

export { concatMiddleware, createStyleSet, testIds, withEmoji } from 'botframework-webchat-component';
export { Constants, createStore, createStoreWithDevTools, createStoreWithOptions } from 'botframework-webchat-core';
export { default as createBrowserWebSpeechPonyfillFactory } from '../../createBrowserWebSpeechPonyfillFactory';
export { ReactWebChat as default, ReactWebChat } from './component/fullSet';
export { default as createDirectLine } from './private/createDirectLine';
export { default as createDirectLineAppServiceExtension } from './private/createDirectLineAppServiceExtension';
export { renderWebChat } from './renderWebChat/fullSet';
export { type StrictStyleOptions, type StyleOptions } from './styleOptions/minimalSet';
export { buildInfoObject as buildInfo, version };
