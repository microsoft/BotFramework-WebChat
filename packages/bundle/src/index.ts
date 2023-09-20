/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

export * from './index-minimal';

import { Components as MinimalComponents, hooks, version, withEmoji } from './index-minimal';
import AdaptiveCardContent from './adaptiveCards/Attachment/AdaptiveCardContent';
import addVersion from './addVersion';
import AnimationCardContent from './adaptiveCards/Attachment/AnimationCardContent';
import AudioCardContent from './adaptiveCards/Attachment/AudioCardContent';
import coreRenderWebChat from './renderWebChat';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsAttachmentForScreenReaderMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createCognitiveServicesSpeechServicesPonyfillFactory from './createCognitiveServicesSpeechServicesPonyfillFactory';
import createDirectLineSpeechAdapters from './createDirectLineSpeechAdapters';
import createStyleSet from './createFullStyleSet';
import defaultCreateDirectLine from './createDirectLine';
import defaultCreateDirectLineAppServiceExtension from './createDirectLineAppServiceExtension';
import FullBundleStyleOptions, { StrictFullBundleStyleOptions } from './types/FullBundleStyleOptions';
import FullComposer from './FullComposer';
import HeroCardContent from './adaptiveCards/Attachment/HeroCardContent';
import OAuthCardContent from './adaptiveCards/Attachment/OAuthCardContent';
import ReactWebChat from './FullReactWebChat';
import ReceiptCardContent from './adaptiveCards/Attachment/ReceiptCardContent';
import renderMarkdown from './markdown/renderMarkdown';
import SignInCardContent from './adaptiveCards/Attachment/SignInCardContent';
import ThumbnailCardContent from './adaptiveCards/Attachment/ThumbnailCardContent';
import useAdaptiveCardsHostConfig from './adaptiveCards/hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from './adaptiveCards/hooks/useAdaptiveCardsPackage';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import VideoCardContent from './adaptiveCards/Attachment/VideoCardContent';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export const createDirectLine = (options: Omit<Parameters<typeof defaultCreateDirectLine>[0], 'botAgent'>) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Full)` });
};

export const createDirectLineAppServiceExtension = (
  options: Omit<Parameters<typeof defaultCreateDirectLineAppServiceExtension>[0], 'botAgent'>
) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (Full)` });
};

const patchedHooks = {
  ...hooks,
  useAdaptiveCardsHostConfig,
  useAdaptiveCardsPackage,
  useStyleOptions,
  useStyleSet
};

const AdditionalComponents = {
  AdaptiveCardContent,
  AnimationCardContent,
  AudioCardContent,
  Composer: FullComposer,
  HeroCardContent,
  OAuthCardContent,
  ReceiptCardContent,
  SignInCardContent,
  ThumbnailCardContent,
  VideoCardContent
};

const Components: typeof MinimalComponents & typeof AdditionalComponents = {
  ...MinimalComponents,
  ...AdditionalComponents
};

type StyleOptions = FullBundleStyleOptions;
type StrictStyleOptions = StrictFullBundleStyleOptions;

export default ReactWebChat;

export {
  Components,
  createAdaptiveCardsAttachmentMiddleware,
  createAdaptiveCardsAttachmentForScreenReaderMiddleware,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLineSpeechAdapters,
  createStyleSet,
  patchedHooks as hooks,
  renderMarkdown,
  renderWebChat,
  withEmoji
};

export type { StyleOptions, StrictStyleOptions };

window['WebChat'] = {
  ...window['WebChat'],
  Components,
  createAdaptiveCardsAttachmentMiddleware,
  createAdaptiveCardsAttachmentForScreenReaderMiddleware,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine,
  createDirectLineAppServiceExtension,
  createDirectLineSpeechAdapters,
  createStyleSet,
  hooks: patchedHooks,
  ReactWebChat,
  renderMarkdown,
  renderWebChat,
  withEmoji
};

addVersion('full');
