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
import defaultCreateDirectLine from '../../createDirectLine';
import defaultCreateDirectLineAppServiceExtension from '../../createDirectLineAppServiceExtension';
import useStyleOptions from '../../hooks/useStyleOptions';
import useStyleSet from '../../hooks/useStyleSet';
import coreRenderWebChat from '../../renderWebChat';
import buildInfo from '../buildInfo';
import { Components as minimalComponents, hooks as minimalHooks } from './minimal';

buildInfo.set('variant', 'full');

const { readonlyObject: buildInfoReadonlyObject, version } = buildInfo;

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

const createDirectLine = (options: Omit<Parameters<typeof defaultCreateDirectLine>[0], 'botAgent'>) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Full)` });
};

const createDirectLineAppServiceExtension = (
  options: Omit<Parameters<typeof defaultCreateDirectLineAppServiceExtension>[0], 'botAgent'>
) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (Full)` });
};

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
export default ReactWebChat;

export {
  buildInfoReadonlyObject as buildInfo,
  Components,
  createDirectLine,
  createDirectLineAppServiceExtension,
  hooks,
  ReactWebChat,
  renderWebChat,
  version
};
// #endregion
