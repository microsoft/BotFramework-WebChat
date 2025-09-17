import Composer from '../../FullComposer';
import ReactWebChat from '../../FullReactWebChat';
import AdaptiveCardContent from '../../adaptiveCards/Attachment/AdaptiveCardContent';
import AnimationCardContent from '../../adaptiveCards/Attachment/AnimationCardContent';
import AudioCardContent from '../../adaptiveCards/Attachment/AudioCardContent';
import HeroCardContent from '../../adaptiveCards/Attachment/HeroCardContent';
import OAuthCardContent from '../../adaptiveCards/Attachment/OAuthCardContent';
import ReceiptCardContent from '../../adaptiveCards/Attachment/ReceiptCardContent';
import SignInCardContent from '../../adaptiveCards/Attachment/SignInCardContent';
import ThumbnailCardContent from '../../adaptiveCards/Attachment/ThumbnailCardContent';
import VideoCardContent from '../../adaptiveCards/Attachment/VideoCardContent';
import useAdaptiveCardsHostConfig from '../../adaptiveCards/hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../../adaptiveCards/hooks/useAdaptiveCardsPackage';
import buildInfo from '../../buildInfo';
import useStyleOptions from '../../hooks/useStyleOptions';
import useStyleSet from '../../hooks/useStyleSet';
import coreRenderWebChat from '../../renderWebChat';
import { Components as minimalComponents, hooks as minimalHooks } from './minimal';

buildInfo.set('variant', 'full');

const { object: buildInfoObject, version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

const hooks = Object.freeze({
  ...minimalHooks,
  useAdaptiveCardsHostConfig,
  useAdaptiveCardsPackage,
  useStyleOptions,
  useStyleSet
});

const Components = Object.freeze({
  ...minimalComponents,
  AdaptiveCardContent,
  AnimationCardContent,
  AudioCardContent,
  Composer,
  HeroCardContent,
  OAuthCardContent,
  ReactWebChat,
  ReceiptCardContent,
  SignInCardContent,
  ThumbnailCardContent,
  VideoCardContent
} as const);

// #region Re-exports
export { default as createAdaptiveCardsAttachmentForScreenReaderMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
export { default as createAdaptiveCardsAttachmentMiddleware } from '../../adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
export { default as createCognitiveServicesSpeechServicesPonyfillFactory } from '../../createCognitiveServicesSpeechServicesPonyfillFactory';
export { default as createDirectLineSpeechAdapters } from '../../createDirectLineSpeechAdapters';
export { default as createStyleSet } from '../../createFullStyleSet';
export { default as renderMarkdown } from '../../markdown/renderMarkdown';
export { type AdaptiveCardsPackage } from '../../types/AdaptiveCardsPackage';
export {
  type StrictFullBundleStyleOptions as StrictStyleOptions,
  type default as StyleOptions
} from '../../types/FullBundleStyleOptions';
export {
  concatMiddleware,
  Constants,
  createBrowserWebSpeechPonyfillFactory,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  decorator,
  internal,
  testIds,
  withEmoji
} from './minimal';
// #endregion

// #region Local exports
export { buildInfoObject as buildInfo, Components, hooks, ReactWebChat, renderWebChat, version };
// #endregion
