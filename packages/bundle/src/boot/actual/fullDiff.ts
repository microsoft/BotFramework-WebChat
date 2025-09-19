// This file is "full set", it includes everything from the "minimal set".

import ReactWebChat from '../../FullReactWebChat';
import buildInfo from '../../buildInfo';
import coreRenderWebChat from '../../renderWebChat';

buildInfo.set('variant', 'full');

const { version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

// Overrides
export { default as createStyleSet } from '../../createFullStyleSet';
export {
  type StrictFullBundleStyleOptions as StrictStyleOptions,
  type default as StyleOptions
} from '../../types/FullBundleStyleOptions';
export { ReactWebChat, renderWebChat, version };
export default ReactWebChat;

// Adds
export { default as createAdaptiveCardsAttachmentForScreenReaderMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
export { default as createAdaptiveCardsAttachmentMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
export { default as createCognitiveServicesSpeechServicesPonyfillFactory } from '../../createCognitiveServicesSpeechServicesPonyfillFactory';
export { default as createDirectLineSpeechAdapters } from '../../createDirectLineSpeechAdapters';
export { default as renderMarkdown } from '../../markdown/renderMarkdown';
export { type AdaptiveCardsPackage } from '../../types/AdaptiveCardsPackage';
