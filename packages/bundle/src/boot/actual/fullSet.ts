// This file is "full set", it includes everything from the "minimal set".

import ReactWebChat from '../../FullReactWebChat';
import buildInfo from '../../buildInfo';
import coreRenderWebChat from '../../renderWebChat';

buildInfo.set('variant', 'full');

const { version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

// First, exports everything from minimal.
export * from './minimalSet';

// Then, overrides exports of minimal.
export { default as createStyleSet } from '../../createFullStyleSet';
export {
  type StrictFullBundleStyleOptions as StrictStyleOptions,
  type default as StyleOptions
} from '../../types/FullBundleStyleOptions';
export * as Components from './component/fullSet';
export * as hooks from './hook/fullSet';
export { ReactWebChat, renderWebChat, version };
export default ReactWebChat;

// Lastly, adds new exports.
export { default as createAdaptiveCardsAttachmentForScreenReaderMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
export { default as createAdaptiveCardsAttachmentMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
export { default as createCognitiveServicesSpeechServicesPonyfillFactory } from '../../createCognitiveServicesSpeechServicesPonyfillFactory';
export { default as createDirectLineSpeechAdapters } from '../../createDirectLineSpeechAdapters';
export { default as renderMarkdown } from '../../markdown/renderMarkdown';
export { type AdaptiveCardsPackage } from '../../types/AdaptiveCardsPackage';
