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
import createAdaptiveCardsAttachmentForScreenReaderMiddleware from '../../adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createAdaptiveCardsAttachmentMiddleware from '../../adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import useAdaptiveCardsHostConfig from '../../adaptiveCards/hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from '../../adaptiveCards/hooks/useAdaptiveCardsPackage';
import createCognitiveServicesSpeechServicesPonyfillFactory from '../../createCognitiveServicesSpeechServicesPonyfillFactory';
import defaultCreateDirectLine from '../../createDirectLine';
import defaultCreateDirectLineAppServiceExtension from '../../createDirectLineAppServiceExtension';
import createDirectLineSpeechAdapters from '../../createDirectLineSpeechAdapters';
import createStyleSet from '../../createFullStyleSet';
import useStyleOptions from '../../hooks/useStyleOptions';
import useStyleSet from '../../hooks/useStyleSet';
import renderMarkdown from '../../markdown/renderMarkdown';
import coreRenderWebChat from '../../renderWebChat';
import { type AdaptiveCardsPackage } from '../../types/AdaptiveCardsPackage';
import FullBundleStyleOptions, { StrictFullBundleStyleOptions } from '../../types/FullBundleStyleOptions';
import { Components as MinimalComponents, hooks, buildInfo as minimalBuildInfo, version, withEmoji } from './minimal';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

const buildInfo = Object.freeze({ ...minimalBuildInfo, variant: 'full' });

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

const patchedHooks = Object.freeze({
  ...hooks,
  useAdaptiveCardsHostConfig,
  useAdaptiveCardsPackage,
  useStyleOptions,
  useStyleSet
});

const AdditionalComponents = Object.freeze({
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
});

const Components: Readonly<typeof MinimalComponents & typeof AdditionalComponents> = Object.freeze({
  ...MinimalComponents,
  ...AdditionalComponents
});

type StyleOptions = FullBundleStyleOptions;
type StrictStyleOptions = StrictFullBundleStyleOptions;

export default ReactWebChat;
export {
  activityComponent,
  Constants,
  concatMiddleware,
  createActivityPolyMiddleware,
  createBrowserWebSpeechPonyfillFactory,
  createStore,
  createStoreWithDevTools,
  createStoreWithOptions,
  decorator,
  internal,
  testIds,
  version
} from './minimal';
export {
  Components,
  ReactWebChat,
  buildInfo,
  createAdaptiveCardsAttachmentForScreenReaderMiddleware,
  createAdaptiveCardsAttachmentMiddleware,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine,
  createDirectLineAppServiceExtension,
  createDirectLineSpeechAdapters,
  createStyleSet,
  patchedHooks as hooks,
  renderMarkdown,
  renderWebChat,
  withEmoji,
  type AdaptiveCardsPackage,
  type StrictStyleOptions,
  type StyleOptions
};
