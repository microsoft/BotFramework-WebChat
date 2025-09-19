export * from './minimalSet';

// #region Build info
import buildInfo from '../../buildInfo';

buildInfo.set('variant', 'full');

const { version } = buildInfo;
// #endregion

// #region Overrides
export { default as createStyleSet } from '../../createFullStyleSet';
export { ReactWebChat as default, ReactWebChat } from './component/fullSet';
export { renderWebChat } from './renderWebChat/fullSet';
export { type StrictStyleOptions, type StyleOptions } from './styleOptions/fullSet';
export { version };
// #endregion

// #region Adds
export { default as createAdaptiveCardsAttachmentForScreenReaderMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
export { default as createAdaptiveCardsAttachmentMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
export { default as createCognitiveServicesSpeechServicesPonyfillFactory } from '../../createCognitiveServicesSpeechServicesPonyfillFactory';
export { default as createDirectLineSpeechAdapters } from '../../createDirectLineSpeechAdapters';
export { default as renderMarkdown } from '../../markdown/renderMarkdown';
export { type AdaptiveCardsPackage } from '../../types/AdaptiveCardsPackage';
// #endregion
