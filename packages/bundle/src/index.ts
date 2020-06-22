/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

export * from './index-minimal';

import { Components as MinimalComponents, hooks, version } from './index-minimal';
import AdaptiveCardContent from './adaptiveCards/Attachment/AdaptiveCardContent';
import addVersion from './addVersion';
import AnimationCardContent from './adaptiveCards/Attachment/AnimationCardContent';
import AudioCardContent from './adaptiveCards/Attachment/AudioCardContent';
import coreRenderWebChat from './renderWebChat';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createCognitiveServicesSpeechServicesPonyfillFactory from './createCognitiveServicesSpeechServicesPonyfillFactory';
import createDirectLineSpeechAdapters from './createDirectLineSpeechAdapters';
import createStyleSet from './createFullStyleSet';
import defaultCreateDirectLine from './createDirectLine';
import defaultCreateDirectLineAppServiceExtension from './createDirectLineAppServiceExtension';
import FullComposer from './FullComposer';
import HeroCardContent from './adaptiveCards/Attachment/HeroCardContent';
import OAuthCardContent from './adaptiveCards/Attachment/OAuthCardContent';
import ReactWebChat from './FullReactWebChat';
import ReceiptCardContent from './adaptiveCards/Attachment/ReceiptCardContent';
import renderMarkdown from './renderMarkdown';
import SignInCardContent from './adaptiveCards/Attachment/SignInCardContent';
import ThumbnailCardContent from './adaptiveCards/Attachment/ThumbnailCardContent';
import useAdaptiveCardsHostConfig from './adaptiveCards/hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from './adaptiveCards/hooks/useAdaptiveCardsPackage';
import VideoCardContent from './adaptiveCards/Attachment/VideoCardContent';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export const createDirectLine = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Full)` });
};

export const createDirectLineAppServiceExtension = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (Full)` });
};

const patchedHooks = {
  ...hooks,
  useAdaptiveCardsHostConfig,
  useAdaptiveCardsPackage
};

const Components = {
  ...MinimalComponents,
  AdaptiveCardContent,
  AudioCardContent,
  AnimationCardContent,
  Composer: FullComposer,
  HeroCardContent,
  OAuthCardContent,
  ReceiptCardContent,
  SignInCardContent,
  ThumbnailCardContent,
  VideoCardContent
};

export default ReactWebChat;

export {
  Components,
  createAdaptiveCardsAttachmentMiddleware,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLineSpeechAdapters,
  createStyleSet,
  patchedHooks as hooks,
  renderMarkdown,
  renderWebChat
};

window['WebChat'] = {
  ...window['WebChat'],
  Components,
  createAdaptiveCardsAttachmentMiddleware,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine,
  createDirectLineAppServiceExtension,
  createDirectLineSpeechAdapters,
  createStyleSet,
  hooks: patchedHooks,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
};

addVersion('full');
