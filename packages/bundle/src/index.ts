/* eslint dot-notation: ["error", { "allowPattern": "^WebChat$" }] */
// window['WebChat'] is required for TypeScript

export * from './index-minimal';

import { Components as MinimalComponents, hooks, version } from './index-minimal';
import addVersion from './addVersion';
import coreRenderWebChat from './renderWebChat';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createCognitiveServicesBingSpeechPonyfillFactory from './createCognitiveServicesBingSpeechPonyfillFactory';
import createCognitiveServicesSpeechServicesPonyfillFactory from './createCognitiveServicesSpeechServicesPonyfillFactory';
import createStyleSet from './createFullStyleSet';
import createDirectLineSpeechAdapters from './createDirectLineSpeechAdapters';
import defaultCreateDirectLine from './createDirectLine';
import FullComposer from './FullComposer';
import ReactWebChat from './FullReactWebChat';
import renderMarkdown from './renderMarkdown';
import useAdaptiveCardsHostConfig from './adaptiveCards/hooks/useAdaptiveCardsHostConfig';
import useAdaptiveCardsPackage from './adaptiveCards/hooks/useAdaptiveCardsPackage';

const renderWebChat = coreRenderWebChat.bind(null, ReactWebChat);

export const createDirectLine = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );
  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (Full)` });
};

const patchedHooks = {
  ...hooks,
  useAdaptiveCardsHostConfig,
  useAdaptiveCardsPackage
};

const Components = {
  ...MinimalComponents,
  Composer: FullComposer
};

export default ReactWebChat;

export {
  Components,
  createAdaptiveCardsAttachmentMiddleware,
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLineSpeechAdapters,
  createStyleSet,
  patchedHooks as hooks,
  renderMarkdown,
  renderWebChat
};

window['WebChat'] = {
  ...window['WebChat'],
  createAdaptiveCardsAttachmentMiddleware,
  createCognitiveServicesBingSpeechPonyfillFactory,
  createCognitiveServicesSpeechServicesPonyfillFactory,
  createDirectLine,
  createDirectLineSpeechAdapters,
  createStyleSet,
  hooks: patchedHooks,
  ReactWebChat,
  renderMarkdown,
  renderWebChat
};

addVersion('full');
